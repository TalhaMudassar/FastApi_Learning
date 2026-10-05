"""add_stripe_tracking_and_processed_events_table

Revision ID: 7b01e7aba69d
Revises: aed276c68da0
Create Date: 2026-10-02 17:40:10.781912

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b01e7aba69d'
down_revision: Union[str, Sequence[str], None] = 'aed276c68da0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add Stripe columns to payments and create processed_stripe_events table."""
    # 1. Add new columns to payments table
    op.add_column(
        'payments',
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='usd')
    )
    op.add_column(
        'payments',
        sa.Column('client_secret', sa.String(length=255), nullable=True)
    )
    op.add_column(
        'payments',
        sa.Column('error_message', sa.String(length=500), nullable=True)
    )

    # 2. Create processed_stripe_events table for webhook idempotency
    op.create_table(
        'processed_stripe_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.String(length=100), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id')
    )
    op.create_index(
        op.f('ix_processed_stripe_events_id'),
        'processed_stripe_events',
        ['id'],
        unique=False
    )
    op.create_index(
        op.f('ix_processed_stripe_events_event_id'),
        'processed_stripe_events',
        ['event_id'],
        unique=True
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_processed_stripe_events_event_id'), table_name='processed_stripe_events')
    op.drop_index(op.f('ix_processed_stripe_events_id'), table_name='processed_stripe_events')
    op.drop_table('processed_stripe_events')
    op.drop_column('payments', 'error_message')
    op.drop_column('payments', 'client_secret')
    op.drop_column('payments', 'currency')
