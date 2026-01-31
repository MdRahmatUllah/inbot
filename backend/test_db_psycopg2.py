"""Test database connection with psycopg2."""

import psycopg2


def test_connection():
    """Test PostgreSQL connection."""
    try:
        conn = psycopg2.connect(
            host='127.0.0.1',
            port=5433,
            user='inbot',
            password='inbot_password',
            database='inbot'
        )
        
        cursor = conn.cursor()
        cursor.execute('SELECT version()')
        version = cursor.fetchone()[0]
        print(f"✅ Connected to PostgreSQL!")
        print(f"   Version: {version}")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


if __name__ == "__main__":
    test_connection()

