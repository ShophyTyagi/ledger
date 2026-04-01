from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.settings import api_settings as jwt_settings
from .models import Invoice
from .serializers import InvoiceSerializer, RegisterSerializer


def _set_auth_cookies(response, access_token, refresh_token=None):
    """Attach JWT tokens as HttpOnly cookies to a response."""
    secure = not settings.DEBUG
    response.set_cookie(
        'access_token',
        access_token,
        max_age=settings.JWT_ACCESS_COOKIE_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite='Strict',
    )
    if refresh_token is not None:
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=settings.JWT_REFRESH_COOKIE_MAX_AGE,
            httponly=True,
            secure=secure,
            samesite='Strict',
        )


def _clear_auth_cookies(response):
    """Remove JWT cookies from the browser."""
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')


# ── Auth views ────────────────────────────────────────────────────────────────

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        confirm = request.data.get('confirm_new_password', '')

        if not request.user.check_password(current):
            return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm:
            return Response({'detail': 'New passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError
        try:
            validate_password(new_password, request.user)
        except DjangoValidationError as e:
            return Response({'detail': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()

        # Blacklist the old refresh token so any other sessions are invalidated,
        # then issue fresh tokens so this session stays logged in.
        raw_refresh = request.COOKIES.get('refresh_token')
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass

        refresh = RefreshToken.for_user(request.user)
        response = Response({'detail': 'Password updated successfully.'})
        _set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get('password', '')
        if not request.user.check_password(password):
            return Response({'detail': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Blacklist the refresh token so it cannot be reused after deletion.
        raw_refresh = request.COOKIES.get('refresh_token')
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass

        request.user.delete()  # Cascades to all invoices via FK.

        response = Response({'detail': 'Account deleted.'}, status=status.HTTP_200_OK)
        _clear_auth_cookies(response)
        return response


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Account created. You can now log in.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CookieTokenObtainPairView(TokenObtainPairView):
    """Login: validate credentials, issue tokens as HttpOnly cookies."""

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            _set_auth_cookies(response, response.data['access'], response.data['refresh'])
            # Don't expose raw token strings in the response body
            response.data = {'detail': 'Login successful.'}
        return response


class CookieTokenRefreshView(APIView):
    """Refresh: read the refresh cookie, rotate it, issue new cookies."""

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        raw_refresh = request.COOKIES.get('refresh_token')
        if not raw_refresh:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(raw_refresh)
            new_access = str(refresh.access_token)

            new_refresh = None
            if jwt_settings.ROTATE_REFRESH_TOKENS:
                if jwt_settings.BLACKLIST_AFTER_ROTATION:
                    refresh.blacklist()
                refresh.set_jti()
                refresh.set_exp()
                new_refresh = str(refresh)
        except TokenError:
            raise InvalidToken({'detail': 'Token is invalid or expired.'})

        response = Response({'detail': 'Token refreshed.'})
        _set_auth_cookies(response, new_access, new_refresh)
        return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist the refresh token and clear both auth cookies."""
    raw_refresh = request.COOKIES.get('refresh_token')
    if raw_refresh:
        try:
            RefreshToken(raw_refresh).blacklist()
        except TokenError:
            pass

    response = Response(status=status.HTTP_204_NO_CONTENT)
    _clear_auth_cookies(response)
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_view(request):
    """
    Lightweight endpoint the frontend calls on load to check whether the
    stored access cookie is still valid.  Returns the current username so
    the UI can display it without a separate /me/ call.
    """
    return Response({'username': request.user.username})


# ── Invoice views ─────────────────────────────────────────────────────────────

class InvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Scoped to the requesting user — prevents IDOR
        return Invoice.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    invoices = Invoice.objects.filter(user=request.user)

    sent_invoices = invoices.filter(status=Invoice.STATUS_SENT)
    paid_invoices = invoices.filter(status=Invoice.STATUS_PAID)

    total_outstanding = sum(inv.total_amount for inv in sent_invoices)
    total_paid = sum(inv.total_amount for inv in paid_invoices)

    counts = {
        'draft': invoices.filter(status=Invoice.STATUS_DRAFT).count(),
        'sent': invoices.filter(status=Invoice.STATUS_SENT).count(),
        'paid': invoices.filter(status=Invoice.STATUS_PAID).count(),
    }

    recent = InvoiceSerializer(invoices[:5], many=True).data

    return Response({
        'total_outstanding': total_outstanding,
        'total_paid': total_paid,
        'counts': counts,
        'recent_invoices': recent,
    })
