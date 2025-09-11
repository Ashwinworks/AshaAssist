"""
Firebase configuration and initialization
"""
import os
import firebase_admin
from firebase_admin import credentials
from config.settings import Config

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        if Config.FIREBASE_CREDENTIALS_PATH and os.path.exists(Config.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(Config.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully!")
            return True
        else:
            print("Firebase credentials not found. Google Sign-In will not work.")
            return False
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        return False
