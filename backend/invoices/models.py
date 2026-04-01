from decimal import Decimal
from django.db import models
from django.conf import settings


class Invoice(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_SENT = 'sent'
    STATUS_PAID = 'paid'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_SENT, 'Sent'),
        (STATUS_PAID, 'Paid'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invoices',
        # Nullable so migration 0002 can run against existing rows.
        # After all rows have an owner, create a 0003 data migration and
        # then a 0004 migration to make this null=False.
        null=True,
    )
    client_name = models.CharField(max_length=255)
    invoice_number = models.CharField(max_length=100, unique=True)
    line_items = models.JSONField(default=list)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number} - {self.client_name}"

    @property
    def total_amount(self):
        # Use Decimal arithmetic to avoid IEEE 754 floating-point errors on
        # financial values (e.g. 0.1 + 0.2 ≠ 0.3 with float).
        return float(
            sum(Decimal(str(item.get('amount', 0))) for item in self.line_items)
        )
