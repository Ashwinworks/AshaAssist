"""
Vercel serverless function entry point
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

# Create the Flask app instance
app = create_app('production')

# This is required for Vercel
if __name__ == "__main__":
    app.run()
