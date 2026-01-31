"""Test database connection."""

import asyncio
import asyncpg


async def test_connection():
    """Test PostgreSQL connection."""
    # Test with password
    try:
        print("Testing with password...")
        conn = await asyncpg.connect(
            host='127.0.0.1',
            port=5432,
            user='inbot',
            password='inbot_password',
            database='inbot'
        )

        version = await conn.fetchval('SELECT version()')
        print(f"✅ Connected to PostgreSQL with password!")
        print(f"   Version: {version}")

        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Connection with password failed: {e}")

    # Test without password (trust auth)
    try:
        print("\nTesting without password (trust auth)...")
        conn = await asyncpg.connect(
            host='127.0.0.1',
            port=5432,
            user='inbot',
            database='inbot'
        )
        
        version = await conn.fetchval('SELECT version()')
        print(f"✅ Connected to PostgreSQL!")
        print(f"   Version: {version}")
        
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(test_connection())

