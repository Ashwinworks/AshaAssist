"""
Vercel serverless function entry point
"""
import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

# Create a simple test app first
test_app = Flask(__name__)
CORS(test_app)

@test_app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({'status': 'ok', 'message': 'Vercel function is running'}), 200

@test_app.route('/', methods=['GET'])
def root():
    return jsonify({'status': 'ok', 'message': 'AshaAssist API is running on Vercel'}), 200

try:
    # Add the backend directory to the Python path
    backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
    sys.path.insert(0, backend_path)

    # Import the app instance from backend/app.py (not backend/app/__init__.py)
    import importlib.util
    spec = importlib.util.spec_from_file_location("app_module", os.path.join(backend_path, "app.py"))
    if spec and spec.loader:
        app_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(app_module)
        app = app_module.app
        print("[SUCCESS] Main app loaded successfully")
        
        # Add global OPTIONS handler for CORS preflight
        @app.after_request
        def after_request(response):
            response.headers.add('Access-Control-Allow-Origin', 'https://ashaassist.onrender.com')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
    else:
        raise ImportError("Could not load app.py module")
except Exception as e:
    print(f"[ERROR] Failed to load main app: {str(e)}")
    # Fall back to test app
    app = test_app

# This is required for Vercel
if __name__ == "__main__":
    app.run()
