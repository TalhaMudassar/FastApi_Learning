"""add phone column

Revision ID: fe81adbbb824
Revises: 835cb89161fa
Create Date: 2026-02-19 23:51:40.241337

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fe81adbbb824'
down_revision: Union[str, Sequence[str], None] = '835cb89161fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    op.add_column("users", sa.Column("phoneno", sa.Integer()))


def downgrade() -> None:
    op.drop_column("users","phoneno")