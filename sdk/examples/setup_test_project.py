# """
# Setup script to create a test user and project, then get the API key
# Run this once before running your SDK tests
# """
# import requests
# import json

# BACKEND_URL = "http://localhost:8000"

# # 1. Register a test user
# print("1. Registering test user...")
# register_data = {
#     "email": "test@example.com",
#     "password": "testpassword123",
#     "full_name": "Test User"
# }

# try:
#     resp = requests.post(f"{BACKEND_URL}/auth/register", json=register_data)
#     if resp.status_code == 200:
#         print("✓ User registered successfully")
#     elif "already registered" in resp.text.lower():
#         print("✓ User already exists")
#     else:
#         print(f"Registration response: {resp.status_code} - {resp.text}")
# except Exception as e:
#     print(f"Error registering: {e}")

# # 2. Login to get token
# print("\n2. Logging in...")
# login_data = {
#     "username": "test@example.com",
#     "password": "testpassword123"
# }

# resp = requests.post(f"{BACKEND_URL}/auth/login", data=login_data)
# if resp.status_code != 200:
#     print(f"Login failed: {resp.text}")
#     exit(1)

# token = resp.json()["access_token"]
# print("✓ Logged in successfully")

# # 3. Create a project
# print("\n3. Creating test project...")
# headers = {"Authorization": f"Bearer {token}"}
# project_data = {
#     "name": "Test Project",
#     "description": "Project for SDK testing"
# }

# resp = requests.post(f"{BACKEND_URL}/projects", json=project_data, headers=headers)
# if resp.status_code == 200:
#     project = resp.json()
#     api_key = project["api_key"]
#     print(f"✓ Project created successfully")
#     print(f"\n{'='*60}")
#     print(f"Your API Key: {api_key}")
#     print(f"{'='*60}")
#     print(f"\nUpdate your test file with:")
#     print(f'API_KEY = "{api_key}"')
    
#     # Save to .env file
#     with open("sdk/.env", "w") as f:
#         f.write(f"AGENTOPS_API_URL=http://localhost:8000\n")
#         f.write(f"AGENTOPS_API_KEY={api_key}\n")
#     print(f"\n✓ Saved to sdk/.env")
# else:
#     print(f"Project creation failed: {resp.text}")
