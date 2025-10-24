"""
Firebase configuration and initialization
"""
import os
import json
import base64
import firebase_admin
from firebase_admin import credentials
from config.settings import Config

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        if firebase_admin._apps:
            print("Firebase Admin SDK already initialized.")
            return True
        
        # Try to load from environment variable first (for Vercel deployment)
        firebase_creds_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
        
        if firebase_creds_json:
            # Handle base64 encoded credentials (recommended for Vercel)
            try:
                # Try to decode from base64 first
                decoded = base64.b64decode(firebase_creds_json)
                creds_dict = json.loads(decoded)
                print("Loading Firebase credentials from base64 environment variable...")
            except:
                # If not base64, try direct JSON parsing
                creds_dict = json.loads(firebase_creds_json)
                print("Loading Firebase credentials from JSON environment variable...")
            
            cred = credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully from environment variable!")
            return True
        
        # Fallback to file path (for local development)
        elif Config.FIREBASE_CREDENTIALS_PATH and os.path.exists(Config.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(Config.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully from file!")
            return True
        
        else:
            print("Firebase credentials not found. Google Sign-In will not work.")
            print("Set FIREBASE_CREDENTIALS_JSON environment variable or FIREBASE_CREDENTIALS_PATH.")
            return False
            
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        return False
