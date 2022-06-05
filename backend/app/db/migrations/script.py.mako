"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
import app.db.migrations.sql
from alembic import op
import app.db.migrations.sql as sql
import sqlalchemy as sa
import sys
import pathlib

# we're appending the app directory to our path here so that we can import config easily
sys.path.append(str(pathlib.Path(__file__).resolve().parents[4]))  # change depth to root accordingly

${imports if imports else ""}

SQL_DIR = pathlib.Path(sql.__file__).parent

# revision identifiers, used by Alembic
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}



def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
