"""Debug script to test login directly."""

import asyncio
import httpx


async def test_login():
    """Test login endpoint."""
    async with httpx.AsyncClient(base_url="http://localhost:8000/api/v1", timeout=30.0) as client:
        # First, register a user
        print("=== Registering user ===")
        register_data = {
            "email": "logintest@example.com",
            "username": "logintest",
            "password": "testpassword123"
        }
        
        try:
            response = await client.post("/auth/register", json=register_data)
            print(f"Registration Status: {response.status_code}")
            if response.status_code == 201:
                print(f"Registration Response: {response.json()}")
            elif response.status_code == 400:
                print("User already exists")
            else:
                print(f"Registration Error: {response.text}")
        except Exception as e:
            print(f"Registration Exception: {e}")
        
        # Now try to login
        print("\n=== Testing login ===")
        login_data = {
            "email": "logintest@example.com",
            "password": "testpassword123"
        }
        
        try:
            response = await client.post("/auth/login", json=login_data)
            print(f"Login Status: {response.status_code}")
            print(f"Login Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print(f"Login Response: {response.json()}")
            else:
                print(f"Login Error Text: {response.text}")
                print(f"Login Error Content: {response.content}")
        except Exception as e:
            print(f"Login Exception: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_login())

