"""initial_schema

Revision ID: 001
Revises: 
Create Date: 2026-03-26 10:59:44.319744

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial tables."""
    op.create_table(
        'users',
        sa.Column('id', sa.Text, primary_key=True),
        sa.Column('full_name', sa.Text, nullable=False),
        sa.Column('email', sa.Text, unique=True, nullable=False),
        sa.Column('password_hash', sa.Text, nullable=False),
        sa.Column('role', sa.Text, nullable=False),
        sa.Column('created_at', sa.Text, nullable=False),
    )
    op.create_table(
        'profiles',
        sa.Column('user_id', sa.Text, sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('occupation', sa.Text, server_default=''),
        sa.Column('gender_preference', sa.Text, server_default=''),
        sa.Column('bio', sa.Text, server_default=''),
        sa.Column('budget_min', sa.Integer, server_default='0'),
        sa.Column('budget_max', sa.Integer, server_default='0'),
        sa.Column('preferred_city', sa.Text, server_default=''),
        sa.Column('preferred_area', sa.Text, server_default=''),
        sa.Column('lifestyle', sa.Text, server_default=''),
        sa.Column('schedule', sa.Text, server_default=''),
        sa.Column('updated_at', sa.Text),
        sa.Column('avatar', sa.Text, server_default=''),
    )
    op.create_table(
        'listings',
        sa.Column('id', sa.Text, primary_key=True),
        sa.Column('title', sa.Text, nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('rent', sa.Integer, nullable=False),
        sa.Column('city', sa.Text, nullable=False),
        sa.Column('area', sa.Text, nullable=False),
        sa.Column('rooms', sa.Integer, nullable=False),
        sa.Column('amenities', sa.Text, server_default="'[]'"),
        sa.Column('images', sa.Text, server_default="'[]'"),
        sa.Column('status', sa.Text, server_default="'available'"),
        sa.Column('contact_name', sa.Text, nullable=False),
        sa.Column('contact_phone', sa.Text, nullable=False),
        sa.Column('owner_id', sa.Text, nullable=False),
        sa.Column('owner_name', sa.Text, nullable=False),
        sa.Column('views', sa.Integer, server_default='0'),
        sa.Column('created_at', sa.Text, nullable=False),
    )


def downgrade() -> None:
    """Drop initial tables."""
    op.drop_table('listings')
    op.drop_table('profiles')
    op.drop_table('users')
