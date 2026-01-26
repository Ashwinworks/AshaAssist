"""
Test script to verify notification system functionality
Run this to test notification creation and retrieval
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_notification_system():
    """Test the notification system end-to-end"""
    
    print("🧪 Testing Notification System\n")
    print("=" * 60)
    
    # Step 1: Login as ASHA worker
    print("\n1️⃣ Logging in as ASHA worker...")
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "asha@example.com",
            "password": "password123"
        }
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    asha_token = login_response.json().get('token')
    print(f"✅ ASHA worker logged in successfully")
    
    # Step 2: Create a calendar event (this should trigger notifications)
    print("\n2️⃣ Creating a calendar event...")
    event_response = requests.post(
        f"{BASE_URL}/api/calendar-events",
        json={
            "title": "Health Awareness Camp",
            "description": "Community health awareness session",
            "place": "Community Center",
            "date": "2026-02-15",
            "allDay": False,
            "category": "health_camp"
        },
        headers={"Authorization": f"Bearer {asha_token}"}
    )
    
    if event_response.status_code != 201:
        print(f"❌ Event creation failed: {event_response.text}")
        return
    
    event_id = event_response.json().get('id')
    print(f"✅ Calendar event created with ID: {event_id}")
    
    # Step 3: Login as regular user
    print("\n3️⃣ Logging in as regular user...")
    user_login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "user@example.com",
            "password": "password123"
        }
    )
    
    if user_login_response.status_code != 200:
        print(f"⚠️  Regular user login failed (this is OK if no test user exists)")
        print(f"   You can test with actual user credentials")
        return
    
    user_token = user_login_response.json().get('token')
    print(f"✅ Regular user logged in successfully")
    
    # Step 4: Fetch notifications for the user
    print("\n4️⃣ Fetching notifications for user...")
    notifications_response = requests.get(
        f"{BASE_URL}/api/notifications",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    if notifications_response.status_code != 200:
        print(f"❌ Failed to fetch notifications: {notifications_response.text}")
        return
    
    notifications_data = notifications_response.json()
    notifications = notifications_data.get('notifications', [])
    unread_count = notifications_data.get('unreadCount', 0)
    
    print(f"✅ Fetched {len(notifications)} notifications")
    print(f"📬 Unread count: {unread_count}")
    
    if notifications:
        print("\n📋 Latest Notifications:")
        print("-" * 60)
        for i, notif in enumerate(notifications[:5], 1):
            print(f"\n{i}. {notif.get('title')}")
            print(f"   Message: {notif.get('message')}")
            print(f"   Type: {notif.get('type')}")
            print(f"   Read: {'Yes' if notif.get('isRead') else 'No'}")
            print(f"   Created: {notif.get('createdAt')}")
    else:
        print("\n📭 No notifications found")
    
    # Step 5: Mark notification as read
    if notifications and not notifications[0].get('isRead'):
        print(f"\n5️⃣ Marking first notification as read...")
        notif_id = notifications[0].get('id')
        mark_read_response = requests.put(
            f"{BASE_URL}/api/notifications/{notif_id}/read",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        if mark_read_response.status_code == 200:
            print(f"✅ Notification marked as read")
        else:
            print(f"❌ Failed to mark as read: {mark_read_response.text}")
    
    print("\n" + "=" * 60)
    print("🎉 Notification system test complete!\n")


if __name__ == "__main__":
    try:
        test_notification_system()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend server")
        print("   Make sure the backend is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
