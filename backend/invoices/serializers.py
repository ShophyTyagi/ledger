from decimal import Decimal, InvalidOperation
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Invoice


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('That username is already taken.')
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        validate_password(data['password'])
        return data

    def save(self):
        User.objects.create_user(
            username=self.validated_data['username'],
            password=self.validated_data['password'],
        )

MAX_LINE_ITEMS = 100
MAX_DESCRIPTION_LENGTH = 500
MAX_AMOUNT = Decimal('999999999')


class InvoiceSerializer(serializers.ModelSerializer):
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'client_name', 'invoice_number', 'line_items',
            'due_date', 'status', 'created_at', 'total_amount',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'client_name': {'max_length': 255},
            'invoice_number': {'max_length': 100},
        }

    def validate_line_items(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("line_items must be a list.")
        if len(value) == 0:
            raise serializers.ValidationError("At least one line item is required.")
        if len(value) > MAX_LINE_ITEMS:
            raise serializers.ValidationError(
                f"Cannot have more than {MAX_LINE_ITEMS} line items."
            )

        cleaned = []
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each line item must be an object.")
            if 'description' not in item or 'amount' not in item:
                raise serializers.ValidationError(
                    "Each line item must have 'description' and 'amount'."
                )
            description = str(item['description'])
            if len(description) > MAX_DESCRIPTION_LENGTH:
                raise serializers.ValidationError(
                    f"Line item description cannot exceed {MAX_DESCRIPTION_LENGTH} characters."
                )
            try:
                amount = Decimal(str(item['amount']))
            except (TypeError, ValueError, InvalidOperation):
                raise serializers.ValidationError("Each line item amount must be a number.")
            if amount < 0:
                raise serializers.ValidationError("Line item amounts cannot be negative.")
            if amount > MAX_AMOUNT:
                raise serializers.ValidationError(
                    f"Line item amount cannot exceed {MAX_AMOUNT:,}."
                )
            # Strip any extra keys — only store the fields we expect.
            cleaned.append({'description': description, 'amount': float(amount)})

        return cleaned
