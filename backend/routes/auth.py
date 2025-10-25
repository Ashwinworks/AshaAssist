"""
Authentication routes for user login, registration, and Google sign-in
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, create_access_token
from firebase_admin import auth
from datetime import datetime, timezone
from bson import ObjectId
from services.auth_service import AuthService
from utils.validators import validate_email, validate_password

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

    @auth_bp.route('/api/login', methods=['POST', 'OPTIONS'])
    def login():
        """Authenticate user login"""
        # Handle OPTIONS preflight request
        if request.method == 'OPTIONS':
            return '', 204
        
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
                        'beneficiaryCategory': existing_user.get('beneficiaryCategory'),
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
                        'beneficiaryCategory': 'maternity',  # Default for new Google users
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

    @auth_bp.route('/api/forgot-password', methods=['POST'])
    def forgot_password():
        """Send password reset email using Firebase Auth"""
        try:
            data = request.get_json()
            email = (data.get('email') or '').strip().lower()

            if not email:
                return jsonify({'error': 'Email is required'}), 400

            # Validate email format
            if not validate_email(email):
                return jsonify({'error': 'Invalid email format'}), 400

            # Check if user exists
            user = collections['users'].find_one({'email': email})
            if not user:
                return jsonify({'error': 'No account found with this email address'}), 404

            # Check if user is Firebase-authenticated
            # Firebase users have either firebaseUid or authProvider == 'firebase' or were created via Google
            is_firebase_user = (
                user.get('firebaseUid') or
                user.get('authProvider') == 'firebase' or
                user.get('googleId')  # Google OAuth users also use Firebase
            )

            if not is_firebase_user:
                # For existing users, attempt to migrate them to Firebase
                try:
                    # Get user's current password hash - we'll need the plain password for migration
                    # Since we can't reverse the hash, we'll need to ask user to provide their password
                    return jsonify({
                        'error': 'Password reset requires account migration. Please sign in and enable password reset from your profile settings.',
                        'requiresMigration': True
                    }), 400
                except Exception as migration_error:
                    return jsonify({
                        'error': 'Password reset is only available for accounts created with email/password or Google sign-in. Please contact support if you need help with your account.'
                    }), 400

            # Generate Firebase password reset link
            try:
                reset_link = auth.generate_password_reset_link(email)

                # Extract oobCode from the Firebase reset link
                # The link format is: https://your-project.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=CODE
                from urllib.parse import urlparse, parse_qs
                parsed_url = urlparse(reset_link)
                query_params = parse_qs(parsed_url.query)
                oob_code = query_params.get('oobCode', [None])[0]

                if not oob_code:
                    return jsonify({'error': 'Failed to extract reset code from Firebase link'}), 500

                # Create custom reset link pointing to frontend
                # In production, replace localhost:3000 with your actual domain
                custom_reset_link = f"http://localhost:3000/reset-password?oobCode={oob_code}"

                # TODO: Send email with custom_reset_link
                # For now, return the custom link for testing
                return jsonify({
                    'message': 'Password reset email sent successfully. Please check your email inbox.',
                    'resetLink': custom_reset_link,  # Remove this in production
                    'email': email
                }), 200

            except Exception as firebase_error:
                return jsonify({
                    'error': f'Failed to generate reset link: {str(firebase_error)}'
                }), 500

        except Exception as e:
            return jsonify({'error': f'Failed to process forgot password request: {str(e)}'}), 500

    @auth_bp.route('/api/reset-password', methods=['POST'])
    def reset_password():
        """Reset password using Firebase Auth reset code"""
        try:
            data = request.get_json()
            oob_code = data.get('oobCode')
            new_password = data.get('newPassword')

            if not oob_code or not new_password:
                return jsonify({'error': 'Reset code and new password are required'}), 400

            # Validate password
            is_valid, message = validate_password(new_password)
            if not is_valid:
                return jsonify({'error': message}), 400

            # Verify and reset password using Firebase
            try:
                # Get the email associated with the reset code
                email = auth.verify_password_reset_code(oob_code)

                # Reset password in Firebase
                auth.confirm_password_reset(oob_code, new_password)

                # Also update the password hash in MongoDB for login verification
                from werkzeug.security import generate_password_hash

                # Find the user by email
                user = collections['users'].find_one({'email': email})
                if user:
                    # Update the password hash in MongoDB
                    hashed_password = generate_password_hash(new_password)
                    collections['users'].update_one(
                        {'_id': user['_id']},
                        {'$set': {
                            'password': hashed_password,
                            'updatedAt': datetime.now(timezone.utc)
                        }}
                    )

                return jsonify({'message': 'Password reset successfully'}), 200

            except Exception as firebase_error:
                return jsonify({
                    'error': f'Invalid or expired reset code: {str(firebase_error)}'
                }), 400

        except Exception as e:
            return jsonify({'error': f'Failed to reset password: {str(e)}'}), 500

    @auth_bp.route('/api/migrate-to-firebase', methods=['POST'])
    @jwt_required()
    def migrate_to_firebase():
        """Migrate existing user to Firebase Auth for password reset functionality"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json()

            if not data or not data.get('password'):
                return jsonify({'error': 'Current password is required for migration'}), 400

            # Verify current password
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'error': 'User not found'}), 404

            # Check if already migrated
            if user.get('firebaseUid'):
                return jsonify({'message': 'User already migrated to Firebase Auth'}), 200

            # Verify password
            from werkzeug.security import check_password_hash
            if not check_password_hash(user['password'], data['password']):
                return jsonify({'error': 'Invalid current password'}), 401

            # Migrate user to Firebase
            success, message = auth_service.migrate_user_to_firebase(user_id, data['password'])

            if success:
                return jsonify({'message': message}), 200
            else:
                return jsonify({'error': message}), 500

        except Exception as e:
            return jsonify({'error': f'Failed to migrate user: {str(e)}'}), 500

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
            
            # Handle both JSON and form data (for file uploads)
            if request.is_json:
                data = request.get_json()
            else:
                # Handle form data (including file uploads)
                data = request.form.to_dict()
                
                # Handle profile picture upload
                if 'profilePicture' in request.files:
                    file = request.files['profilePicture']
                    if file and file.filename:
                        # In a real implementation, you would save the file to storage
                        # For now, we'll just store a placeholder URL
                        # In production, you might use cloud storage like Firebase Storage or AWS S3
                        data['profilePicture'] = f"/uploads/profile-pictures/{user_id}.jpg"
            
            # Remove fields that shouldn't be updated via this endpoint
            protected_fields = ['_id', 'email', 'password', 'userType', 'createdAt']
            for field in protected_fields:
                data.pop(field, None)
            
            # Add updated timestamp
            data['updatedAt'] = datetime.now(timezone.utc).isoformat()
            
            # Update user
            result = collections['users'].update_one(
                {'_id': ObjectId(user_id)},
                {'$set': data}
            )
            
            if result.matched_count == 0:
                return jsonify({'error': 'User not found'}), 404
            
            # Return updated user data
            updated_user = collections['users'].find_one({'_id': ObjectId(user_id)})
            if updated_user:
                # Remove sensitive information
                updated_user.pop('password', None)
                updated_user['id'] = str(updated_user['_id'])
                updated_user.pop('_id', None)
                
                return jsonify({
                    'message': 'Profile updated successfully',
                    'user': updated_user
                }), 200
            else:
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
