from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from invoices.models import Invoice
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seed the database with a test user and sample invoices'

    def handle(self, *args, **options):
        # Create test user
        username = 'admin'
        email = 'admin@folio.com'
        password = 'password123'

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists — skipping user creation.'))
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Created user: {username} / {password}'))

        # Create sample invoices
        if Invoice.objects.exists():
            self.stdout.write(self.style.WARNING('Invoices already exist — skipping sample data.'))
            return

        today = date.today()
        samples = [
            {
                'client_name': 'Acme Corporation',
                'invoice_number': 'INV-001',
                'line_items': [
                    {'description': 'Web design', 'amount': 1500},
                    {'description': 'SEO setup', 'amount': 300},
                ],
                'due_date': today + timedelta(days=14),
                'status': 'sent',
            },
            {
                'client_name': 'Globex Inc.',
                'invoice_number': 'INV-002',
                'line_items': [
                    {'description': 'Monthly retainer', 'amount': 2000},
                ],
                'due_date': today + timedelta(days=30),
                'status': 'paid',
            },
            {
                'client_name': 'Initech',
                'invoice_number': 'INV-003',
                'line_items': [
                    {'description': 'Consulting — 10h @ $150', 'amount': 1500},
                    {'description': 'Expenses', 'amount': 120},
                ],
                'due_date': today + timedelta(days=7),
                'status': 'draft',
            },
        ]

        for data in samples:
            Invoice.objects.create(**data)

        self.stdout.write(self.style.SUCCESS(f'Created {len(samples)} sample invoices.'))
