"""API testing script for Sprint 1 endpoints."""

import asyncio
import httpx
from typing import Optional, Dict, Any


BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"


class APITester:
    """API testing client."""
    
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=API_BASE, timeout=30.0)
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.session_id: Optional[str] = None
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers."""
        if self.access_token:
            return {"Authorization": f"Bearer {self.access_token}"}
        return {}
    
    async def test_health(self):
        """Test health endpoint."""
        print("\n=== Testing Health Endpoint ===")
        response = await httpx.AsyncClient().get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        print("✅ Health check passed")
    
    async def test_register(self):
        """Test user registration."""
        print("\n=== Testing User Registration ===")
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpassword123"
        }
        response = await self.client.post("/auth/register", json=data)
        print(f"Status: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response Text: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            self.user_id = result["id"]
            print(f"✅ Registration successful - User ID: {self.user_id}")
        elif response.status_code == 400:
            print("⚠️  User already exists (expected if running multiple times)")
        else:
            print(f"❌ Registration failed: {response.text}")
            raise Exception("Registration failed")
    
    async def test_login(self):
        """Test user login."""
        print("\n=== Testing User Login ===")
        data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        response = await self.client.post("/auth/login", json=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            self.access_token = result["access_token"]
            self.refresh_token = result["refresh_token"]
            self.user_id = result["user"]["id"]
            print(f"✅ Login successful")
            print(f"   User ID: {self.user_id}")
            print(f"   Access Token: {self.access_token[:20]}...")
            print(f"   Refresh Token: {self.refresh_token[:20]}...")
            print(f"   Expires in: {result['expires_in']} seconds")
        else:
            print(f"❌ Login failed: {response.text}")
            raise Exception("Login failed")
    
    async def test_refresh_token(self):
        """Test token refresh."""
        print("\n=== Testing Token Refresh ===")
        data = {"refresh_token": self.refresh_token}
        response = await self.client.post("/auth/refresh", json=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            old_access_token = self.access_token
            self.access_token = result["access_token"]
            self.refresh_token = result["refresh_token"]
            print(f"✅ Token refresh successful")
            print(f"   New Access Token: {self.access_token[:20]}...")
            print(f"   Tokens changed: {old_access_token != self.access_token}")
        else:
            print(f"❌ Token refresh failed: {response.text}")
            raise Exception("Token refresh failed")
    
    async def test_create_session(self):
        """Test session creation."""
        print("\n=== Testing Session Creation ===")
        data = {
            "type": "chat",
            "name": "Test Chat Session"
        }
        response = await self.client.post(
            "/sessions",
            json=data,
            headers=self.get_auth_headers()
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            self.session_id = result["id"]
            print(f"✅ Session created successfully")
            print(f"   Session ID: {self.session_id}")
            print(f"   Name: {result['name']}")
            print(f"   Type: {result['type']}")
        else:
            print(f"❌ Session creation failed: {response.text}")
            raise Exception("Session creation failed")

    async def test_list_sessions(self):
        """Test listing sessions."""
        print("\n=== Testing List Sessions ===")
        response = await self.client.get(
            "/sessions",
            headers=self.get_auth_headers()
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Sessions listed successfully")
            print(f"   Total: {result['total']}")
            print(f"   Count: {len(result['sessions'])}")
        else:
            print(f"❌ List sessions failed: {response.text}")
            raise Exception("List sessions failed")

    async def test_get_session(self):
        """Test getting a session."""
        print("\n=== Testing Get Session ===")
        response = await self.client.get(
            f"/sessions/{self.session_id}",
            headers=self.get_auth_headers()
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Session retrieved successfully")
            print(f"   ID: {result['id']}")
            print(f"   Name: {result['name']}")
        else:
            print(f"❌ Get session failed: {response.text}")
            raise Exception("Get session failed")

    async def test_update_session(self):
        """Test updating a session."""
        print("\n=== Testing Update Session ===")
        data = {
            "name": "Updated Test Session",
            "starred": True
        }
        response = await self.client.patch(
            f"/sessions/{self.session_id}",
            json=data,
            headers=self.get_auth_headers()
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Session updated successfully")
            print(f"   Name: {result['name']}")
            print(f"   Starred: {result['starred']}")
        else:
            print(f"❌ Update session failed: {response.text}")
            raise Exception("Update session failed")

    async def test_get_settings(self):
        """Test getting user settings."""
        print("\n=== Testing Get Settings ===")
        response = await self.client.get(
            "/settings",
            headers=self.get_auth_headers()
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Settings retrieved successfully")
            print(f"   Language: {result['language']}")
            print(f"   Theme: {result['theme']}")
        else:
            print(f"❌ Get settings failed: {response.text}")
            raise Exception("Get settings failed")

    async def test_update_settings(self):
        """Test updating user settings."""
        print("\n=== Testing Update Settings ===")
        data = {
            "theme": "dark",
            "font_size": 16
        }
        response = await self.client.patch(
            "/settings",
            json=data,
            headers=self.get_auth_headers()
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"✅ Settings updated successfully")
            print(f"   Theme: {result['theme']}")
            print(f"   Font Size: {result['font_size']}")
        else:
            print(f"❌ Update settings failed: {response.text}")
            raise Exception("Update settings failed")

    async def test_delete_session(self):
        """Test deleting a session."""
        print("\n=== Testing Delete Session ===")
        response = await self.client.delete(
            f"/sessions/{self.session_id}",
            headers=self.get_auth_headers()
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 204:
            print(f"✅ Session deleted successfully")
        else:
            print(f"❌ Delete session failed: {response.text}")
            raise Exception("Delete session failed")

    async def test_unauthorized_access(self):
        """Test that endpoints reject requests without auth."""
        print("\n=== Testing Unauthorized Access ===")

        # Try to access sessions without token
        response = await self.client.get("/sessions")
        print(f"Sessions without auth - Status: {response.status_code}")
        assert response.status_code == 403, "Should reject unauthorized access"

        # Try to access settings without token
        response = await self.client.get("/settings")
        print(f"Settings without auth - Status: {response.status_code}")
        assert response.status_code == 403, "Should reject unauthorized access"

        print("✅ Unauthorized access correctly rejected")

    async def run_all_tests(self):
        """Run all tests in sequence."""
        try:
            await self.test_health()
            await self.test_register()
            await self.test_login()
            await self.test_refresh_token()
            await self.test_unauthorized_access()
            await self.test_create_session()
            await self.test_list_sessions()
            await self.test_get_session()
            await self.test_update_session()
            await self.test_get_settings()
            await self.test_update_settings()
            await self.test_delete_session()

            print("\n" + "="*50)
            print("🎉 ALL TESTS PASSED!")
            print("="*50)
        except Exception as e:
            print("\n" + "="*50)
            print(f"❌ TESTS FAILED: {e}")
            print("="*50)
        finally:
            await self.client.aclose()


async def main():
    """Main test runner."""
    print("="*50)
    print("Sprint 1 API Testing")
    print("="*50)
    print("\nMake sure the backend server is running:")
    print("  cd backend")
    print("  uvicorn app.main:app --reload")
    print("\nStarting tests in 3 seconds...")
    await asyncio.sleep(3)

    tester = APITester()
    await tester.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())

