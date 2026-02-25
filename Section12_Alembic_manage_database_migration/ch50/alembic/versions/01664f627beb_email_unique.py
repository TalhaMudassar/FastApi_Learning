"""email_unique

Revision ID: 01664f627beb
Revises: 91a4a398ab95
Create Date: 2026-02-20 00:53:57.936239

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '01664f627beb'
down_revision: Union[str, Sequence[str], None] = '91a4a398ab95'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.create_unique_constraint("uq_users_email",["email"])

def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_constraint("uq_users_email",["email"])
