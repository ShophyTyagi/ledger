from django.urls import path
from .views import InvoiceListCreateView, InvoiceDetailView, dashboard_view

urlpatterns = [
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('dashboard/', dashboard_view, name='dashboard'),
]
