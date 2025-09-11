"""
Authentication middleware and JWT configuration
"""
from flask import jsonify
from flask_jwt_extended import JWTManager

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

