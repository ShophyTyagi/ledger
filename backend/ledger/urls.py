from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from invoices.views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
)


class LoginThrottle(AnonRateThrottle):
    scope = 'login'


class RefreshThrottle(UserRateThrottle):
    scope = 'refresh'


urlpatterns = [
    # Admin at a non-default path — set DJANGO_ADMIN_URL in production env
    path(settings.ADMIN_URL, admin.site.urls),
    path('api/auth/login/', CookieTokenObtainPairView.as_view(throttle_classes=[LoginThrottle]), name='token_obtain_pair'),
    path('api/auth/refresh/', CookieTokenRefreshView.as_view(throttle_classes=[RefreshThrottle]), name='token_refresh'),
    path('api/', include('invoices.urls')),
]
