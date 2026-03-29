from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    invoices = Invoice.objects.all()

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
