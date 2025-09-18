"""
Authentication routes for user login, registration, and Google sign-in
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, create_access_token
from firebase_admin import auth
from datetime import datetime, timezone
from bson import ObjectId
from services.auth_service import AuthService
from utils.validators import validate_email

# Create blueprint
auth_bp = Blueprint('auth', __name__)

def init_auth_routes(app, collections):
    """Initialize authentication routes with dependencies"""
    auth_service = AuthService(collections['users'])
    
    @auth_bp.route('/api/register', methods=['POST'])
    def register():
        """Register a new user"""
        try:
            data = request.get_json()
            result, status_code = auth_service.register_user(data)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Registration failed: {str(e)}'}), 500

    @auth_bp.route('/api/login', methods=['POST'])
    def login():
        """Authenticate user login"""
        try:
            data = request.get_json()
            result, status_code = auth_service.login_user(data)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Login failed: {str(e)}'}), 500

    @auth_bp.route('/api/auth/google', methods=['POST'])
    def google_login():
        """Google OAuth authentication"""
        try:
            data = request.get_json()
            
            if not data.get('token'):
                return jsonify({'error': 'Google ID token is required'}), 400
            
            # Verify the Google ID token
            try:
                decoded_token = auth.verify_id_token(data['token'])
                google_uid = decoded_token['uid']
                email = (decoded_token.get('email') or '').strip().lower()
                name = decoded_token.get('name', '')
                picture = decoded_token.get('picture', '')
                
                if not email:
                    return jsonify({'error': 'Email not provided by Google'}), 400
                    
            except Exception as e:
                return jsonify({'error': 'Invalid Google token'}), 401
            
            # Check if user already exists
            existing_user = collections['users'].find_one({'email': email})
            
            if existing_user:
                # User exists, log them in
                if not existing_user.get('isActive', True):
                    return jsonify({'error': 'Account is deactivated'}), 401
                
                # Update Google info if not already set
                update_data = {
                    'lastLogin': datetime.now(timezone.utc),
                    'updatedAt': datetime.now(timezone.utc)
                }
                
                if not existing_user.get('googleId'):
                    update_data['googleId'] = google_uid
                    update_data['profilePicture'] = picture
                
                collections['users'].update_one(
                    {'_id': existing_user['_id']},
                    {'$set': update_data}
                )
                
                # Create access token
                access_token = create_access_token(
                    identity=str(existing_user['_id']),
                    additional_claims={
                        'userType': existing_user['userType'],
                        'email': existing_user['email'],
                        'name': existing_user['name']
                    }
                )
                
                return jsonify({
                    'message': 'Google login successful',
                    'access_token': access_token,
                    'user': {
                        'id': str(existing_user['_id']),
                        'email': existing_user['email'],
                        'name': existing_user['name'],
                        'userType': existing_user['userType'],
                        'beneficiaryCategory': existing_user.get('beneficiaryCategory'),
                        'isFirstLogin': existing_user.get('isFirstLogin', False),
                        'profileCompleted': existing_user.get('profileCompleted', False)
                    }
                }), 200
            
            else:
                # New user, create account
                user_doc = {
                    'email': email,
                    'name': name,
                    'googleId': google_uid,
                    'profilePicture': picture,
                    'userType': 'user',  # Default to user type
                    'beneficiaryCategory': 'maternity',  # Temporary default - user will select
                    'isFirstLogin': True,
                    'profileCompleted': False,
                    'createdAt': datetime.now(timezone.utc),
                    'updatedAt': datetime.now(timezone.utc),
                    'lastLogin': datetime.now(timezone.utc),
                    'isActive': True,
                    'authProvider': 'google'
                }
                
                # Insert user
                result = collections['users'].insert_one(user_doc)
                
                # Create access token
                access_token = create_access_token(
                    identity=str(result.inserted_id),
                    additional_claims={
                        'userType': 'user',
                        'email': email,
                        'name': name
                    }
                )
                
                return jsonify({
                    'message': 'Google account created successfully',
                    'access_token': access_token,
                    'user': {
                        'id': str(result.inserted_id),
                        'email': email,
                        'name': name,
                        'userType': 'user',
                        'beneficiaryCategory': 'maternity',
                        'isFirstLogin': True,
                        'profileCompleted': False
                    }
                }), 201
                
        except Exception as e:
            return jsonify({'error': f'Google authentication failed: {str(e)}'}), 500

    @auth_bp.route('/api/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        """Get user profile"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Remove sensitive information
            user.pop('password', None)
            user['id'] = str(user['_id'])
            user.pop('_id', None)
            
            return jsonify({'user': user}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

    @auth_bp.route('/api/profile', methods=['PUT'])
    @jwt_required()
    def update_profile():
        """Update user profile"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            
            # Remove fields that shouldn't be updated via this endpoint
            protected_fields = ['_id', 'email', 'password', 'userType', 'createdAt']
            for field in protected_fields:
                data.pop(field, None)
            
            # Add updated timestamp
            data['updatedAt'] = datetime.now(timezone.utc)
            
            # Update user
            result = collections['users'].update_one(
                {'_id': ObjectId(user_id)},
                {'$set': data}
            )
            
            if result.matched_count == 0:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({'message': 'Profile updated successfully'}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

    @auth_bp.route('/api/check-email', methods=['POST'])
    def check_email():
        """Check if email is available for registration"""
        try:
            data = request.get_json()

            if not data or not data.get('email'):
                return jsonify({'error': 'Email is required'}), 400

            email = data['email'].strip().lower()

            # Validate email format
            if not validate_email(email):
                return jsonify({'error': 'Invalid email format'}), 400

            # Check if user already exists
            existing_user = collections['users'].find_one({'email': email})

            if existing_user:
                return jsonify({
                    'available': False,
                    'message': 'This email is already registered. Please use a different email.'
                }), 200
            else:
                return jsonify({
                    'available': True,
                    'message': 'Email is available for registration'
                }), 200

        except Exception as e:
            return jsonify({'error': f'Email check failed: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(auth_bp)
    
    return auth_service
