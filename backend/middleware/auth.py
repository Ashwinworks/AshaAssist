"""
Authentication middleware and JWT configuration
"""
from flask import jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, get_jwt
from functools import wraps

def init_jwt_middleware(app):
    """Initialize JWT middleware with error handlers"""
    jwt = JWTManager(app)
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization token is required'}), 401

    return jwt

def require_auth(func):
    """Decorator to require authentication"""
    @wraps(func)
    @jwt_required()
    def wrapper(*args, **kwargs):
        # Extract user info from JWT
        jwt_payload = get_jwt()
        if not jwt_payload:
            return jsonify({'error': 'Invalid token'}), 401

        # Add user_id to request object for convenience
        request.user_id = jwt_payload.get('sub')
        return func(*args, **kwargs)
    return wrapper

def require_admin(func):
    """Decorator to require admin access"""
    @wraps(func)
    @jwt_required()
    def wrapper(*args, **kwargs):
        jwt_payload = get_jwt()
        if not jwt_payload:
            return jsonify({'error': 'Invalid token'}), 401

        if jwt_payload.get('userType') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        # Add user_id to request object
        request.user_id = jwt_payload.get('sub')
        return func(*args, **kwargs)
    return wrapper

