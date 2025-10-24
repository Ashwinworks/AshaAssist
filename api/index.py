"""
Vercel serverless function entry point
"""
import sys
import os

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
else:
    raise ImportError("Could not load app.py module")

# This is required for Vercel
if __name__ == "__main__":
    app.run()
