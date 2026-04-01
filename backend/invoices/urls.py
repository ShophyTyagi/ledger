from django.urls import path
from .views import (
    InvoiceListCreateView,
    InvoiceDetailView,
    dashboard_view,
    logout_view,
    verify_view,
    RegisterView,
    ChangePasswordView,
    DeleteAccountView,
)

urlpatterns = [
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/account/password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/account/delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/verify/', verify_view, name='verify'),
]
