"""replace_razorpay_with_stripe_in_payment_gateway_enum

Revision ID: aed276c68da0
Revises: 07c1594cf830
Create Date: 2026-10-02 14:26:36.735826

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aed276c68da0'
down_revision: Union[str, Sequence[str], None] = '07c1594cf830'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Replace razorpay with stripe in payment_gateway ENUM."""
    op.execute(
        "ALTER TABLE payments MODIFY COLUMN payment_gateway ENUM('mock', 'stripe') NOT NULL DEFAULT 'mock'"
    )


def downgrade() -> None:
    """Downgrade schema: Revert payment_gateway ENUM to mock and razorpay."""
    op.execute(
        "ALTER TABLE payments MODIFY COLUMN payment_gateway ENUM('mock', 'razorpay') NOT NULL DEFAULT 'mock'"
    )
