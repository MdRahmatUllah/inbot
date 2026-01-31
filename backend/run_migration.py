"""Run Alembic migrations programmatically."""

import sys
from alembic.config import Config
from alembic import command


def run_migrations():
    """Run all pending migrations."""
    try:
        # Create Alembic config
        alembic_cfg = Config("alembic.ini")
        
        # Run upgrade to head
        print("Running database migrations...")
        command.upgrade(alembic_cfg, "head")
        print("✅ Migrations completed successfully!")
        
        return 0
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(run_migrations())

