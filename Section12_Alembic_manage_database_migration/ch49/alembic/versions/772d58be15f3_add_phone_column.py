"""add phone column

Revision ID: 772d58be15f3
Revises: e7c4ab3ab4dd
Create Date: 2026-02-19 22:30:07.745836

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '772d58be15f3'
down_revision: Union[str, Sequence[str], None] = 'e7c4ab3ab4dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    op.add_column("users", sa.Column("phoneno", sa.Integer()))


def downgrade() -> None:
    op.drop_column("users","phoneno")