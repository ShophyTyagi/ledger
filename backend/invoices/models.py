from django.db import models


class Invoice(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_SENT = 'sent'
    STATUS_PAID = 'paid'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_SENT, 'Sent'),
        (STATUS_PAID, 'Paid'),
    ]

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
        return sum(float(item.get('amount', 0)) for item in self.line_items)
