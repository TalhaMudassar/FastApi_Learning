"""phonecol_unique

Revision ID: 91a4a398ab95
Revises: fe81adbbb824
Create Date: 2026-02-19 23:54:26.317066

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '91a4a398ab95'
down_revision: Union[str, Sequence[str], None] = 'fe81adbbb824'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.create_unique_constraint("uq_users_phone",["phoneno"])

def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_constraint("uq_users_phone",["phoneno"])