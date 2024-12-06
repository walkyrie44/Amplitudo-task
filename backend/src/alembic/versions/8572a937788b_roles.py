"""Roles

Revision ID: 8572a937788b
Revises: 7d967addb0ef
Create Date: 2024-12-06 16:31:09.813656

"""
from typing import Sequence, Union

from alembic import op


revision: str = '8572a937788b'
down_revision: Union[str, None] = '7d967addb0ef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("""
    INSERT INTO roles (id, name) 
    VALUES 
        (1, 'admin'), 
        (2, 'user')
    """)

def downgrade():
    op.execute("DELETE FROM roles WHERE name IN ('admin', 'user')")