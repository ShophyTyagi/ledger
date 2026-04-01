"""
Add the user ForeignKey to Invoice.

The initial migration (0001) created the table without user ownership.
This migration adds the column as nullable first so it can be applied to
databases that already contain rows, then a data migration (if needed) can
populate the field before making it non-null in a follow-up migration.
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('invoices', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='invoice',
            name='user',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='invoices',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
