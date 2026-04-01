import os
import secrets
import string
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from invoices.models import Invoice
from datetime import date, timedelta


def generate_password(length=16):
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*'
    return ''.join(secrets.choice(alphabet) for _ in range(length))


class Command(BaseCommand):
    help = 'Seed the database with a test user and sample invoices'

    def handle(self, *args, **options):
        username = 'admin'
        email = 'admin@ledger.app'

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists — skipping.'))
            user = User.objects.get(username=username)
        else:
            password = generate_password()
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
            )
            # Write credentials to a restricted file instead of stdout so
            # the password is not captured by CI/CD logs or shell history.
            creds_file = settings.BASE_DIR / 'seed_credentials.txt'
            with open(creds_file, 'w') as f:
                f.write(f'username: {username}\npassword: {password}\n')
            os.chmod(creds_file, 0o600)
            self.stdout.write(self.style.SUCCESS(
                f'Created user "{username}". Credentials saved to {creds_file}\n'
                f'Delete that file after copying the password.'
            ))

        if Invoice.objects.filter(user=user).exists():
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
            Invoice.objects.create(user=user, **data)

        self.stdout.write(self.style.SUCCESS(f'Created {len(samples)} sample invoices.'))
