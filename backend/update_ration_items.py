"""
Script to update all monthly ration records with the latest items list
Run this after updating the ration items in the service
"""
import requests
import json

# Configuration
BASE_URL = 'http://localhost:5000'
LOGIN_URL = f'{BASE_URL}/api/auth/login'
UPDATE_URL = f'{BASE_URL}/api/monthly-rations/update-items'

# You need to login as an anganvaadi worker or admin
# Update these credentials with a valid anganvaadi/admin user
EMAIL = 'anganvaadi@example.com'  # Change this to your anganvaadi user email
PASSWORD = 'password123'  # Change this to the user's password

def update_ration_items():
    """Login and call the update endpoint"""
    try:
        # Step 1: Login to get JWT token
        print("Logging in...")
        login_response = requests.post(LOGIN_URL, json={
            'email': EMAIL,
            'password': PASSWORD
        })
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.text}")
            return
        
        token = login_response.json().get('access_token')
        if not token:
            print("No access token received")
            return
        
        print("Login successful!")
        
        # Step 2: Call the update endpoint
        print("Updating ration items...")
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        update_response = requests.post(UPDATE_URL, headers=headers)
        
        if update_response.status_code == 200:
            result = update_response.json()
            print(f"✓ Success: {result.get('message')}")
            print(f"  Modified {result.get('modifiedCount', 0)} records")
        else:
            print(f"Update failed: {update_response.text}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    print("=" * 60)
    print("Monthly Ration Items Update Script")
    print("=" * 60)
    update_ration_items()
    print("=" * 60)
