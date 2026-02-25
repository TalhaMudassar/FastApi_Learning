"""add phone column

Revision ID: 37b20a622f38
Revises: 2880a02ffff2
Create Date: 2026-02-19 22:06:37.286318

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37b20a622f38'
down_revision: Union[str, Sequence[str], None] = '2880a02ffff2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phoneno", sa.String()))


def downgrade() -> None:
    op.drop_column("users","phoneno")
