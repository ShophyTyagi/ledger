from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'client_name', 'invoice_number', 'line_items',
            'due_date', 'status', 'created_at', 'total_amount',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_line_items(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("line_items must be a list.")
        for item in value:
            if 'description' not in item or 'amount' not in item:
                raise serializers.ValidationError(
                    "Each line item must have 'description' and 'amount'."
                )
            try:
                float(item['amount'])
            except (TypeError, ValueError):
                raise serializers.ValidationError("Each line item amount must be a number.")
        return value
