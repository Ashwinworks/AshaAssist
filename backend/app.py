from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import re
from bson import ObjectId
import json
import bcrypt
import firebase_admin
from firebase_admin import credentials, auth

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
    db = client[os.getenv('DATABASE_NAME', 'ashaassist')]
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Firebase Admin SDK initialization
try:
    firebase_credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
    if firebase_credentials_path and os.path.exists(firebase_credentials_path):
        cred = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully!")
    else:
        print("Firebase credentials not found. Google Sign-In will not work.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

# Collections
users_collection = db.users
asha_workers_collection = db.asha_workers
admins_collection = db.admins

def create_default_accounts():
    """Create default ASHA worker and admin accounts if they don't exist"""
    try:
        # Check if ASHA worker exists
        asha_exists = users_collection.find_one({"email": "asha@gmail.com"})
        if not asha_exists:
            asha_account = {
                "name": "ASHA Worker - Ward 1",
                "email": "asha@gmail.com",
                "phone": "9876543210",
                "password": generate_password_hash("asha123"),
                "userType": "asha_worker",
                "ward": "Ward 1",
                "isActive": True,
                "isFirstLogin": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            users_collection.insert_one(asha_account)
            print("✓ Default ASHA worker account created: asha@gmail.com / asha123")
        
        # Check if admin exists
        admin_exists = users_collection.find_one({"email": "admin@example.com"})
        if not admin_exists:
            admin_account = {
                "name": "Panchayat Health Representative",
                "email": "admin@example.com",
                "phone": "9876543211",
                "password": generate_password_hash("admin123"),
                "userType": "admin",
                "ward": "Ward 1",
                "designation": "Panchayat Health Representative",
                "isActive": True,
                "isFirstLogin": True,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            users_collection.insert_one(admin_account)
            print("✓ Default admin account created: admin@example.com / admin123")
            
    except Exception as e:
        print(f"Error creating default accounts: {e}")

# Create default accounts on startup
create_default_accounts()

# Helper functions
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    pattern = r'^[6-9]\d{9}$'  # Indian mobile number format
    return re.match(pattern, phone) is not None

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

app.json_encoder = JSONEncoder

# Routes
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Welcome to AshaAssist API',
        'version': '1.0.0',
        'status': 'running'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        db.command('ping')
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'phone', 'userType', 'beneficiaryCategory']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate phone format
        if not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Restrict registration to users only
        if data['userType'] not in ['user']:
            return jsonify({
                'error': 'Registration is only allowed for families/individuals. ASHA workers and admins have pre-defined accounts.',
                'message': 'Please contact your local health department for ASHA worker or admin access.'
            }), 403
        
        # Validate beneficiary category for users
        if data['userType'] == 'user' and data['beneficiaryCategory'] not in ['maternity', 'palliative']:
            return jsonify({'error': 'Invalid beneficiary category'}), 400
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        # Create user document
        user_doc = {
            'email': data['email'],
            'password': hashed_password,
            'name': data['name'],
            'phone': data['phone'],
            'userType': data['userType'],
            'beneficiaryCategory': data['beneficiaryCategory'] if data['userType'] == 'user' else None,
            'isFirstLogin': True,
            'profileCompleted': False,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow(),
            'isActive': True
        }
        
        # Insert user
        result = users_collection.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(
            identity=str(result.inserted_id),
            additional_claims={
                'userType': data['userType'],
                'email': data['email'],
                'name': data['name']
            }
        )
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': str(result.inserted_id),
                'email': data['email'],
                'name': data['name'],
                'userType': data['userType'],
                'beneficiaryCategory': data['beneficiaryCategory'] if data['userType'] == 'user' else None,
                'isFirstLogin': True,
                'profileCompleted': False
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': data['email']})
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not check_password_hash(user['password'], data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if user is active
        if not user.get('isActive', True):
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Create access token
        access_token = create_access_token(
            identity=str(user['_id']),
            additional_claims={
                'userType': user['userType'],
                'email': user['email'],
                'name': user['name']
            }
        )
        
        # Update last login
        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'lastLogin': datetime.utcnow()}}
        )
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'name': user['name'],
                'userType': user['userType'],
                'beneficiaryCategory': user.get('beneficiaryCategory'),
                'isFirstLogin': user.get('isFirstLogin', False),
                'profileCompleted': user.get('profileCompleted', False)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/google', methods=['POST'])
def google_login():
    try:
        data = request.get_json()
        
        if not data.get('token'):
            return jsonify({'error': 'Google ID token is required'}), 400
        
        # Verify the Google ID token
        try:
            decoded_token = auth.verify_id_token(data['token'])
            google_uid = decoded_token['uid']
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')
            picture = decoded_token.get('picture', '')
            
            if not email:
                return jsonify({'error': 'Email not provided by Google'}), 400
                
        except Exception as e:
            return jsonify({'error': 'Invalid Google token'}), 401
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        
        if existing_user:
            # User exists, log them in
            if not existing_user.get('isActive', True):
                return jsonify({'error': 'Account is deactivated'}), 401
            
            # Update Google info if not already set
            update_data = {
                'lastLogin': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            }
            
            if not existing_user.get('googleId'):
                update_data['googleId'] = google_uid
                update_data['profilePicture'] = picture
            
            users_collection.update_one(
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
            # For Google sign-in, we'll create a basic user account
            # They can complete their profile later
            user_doc = {
                'email': email,
                'name': name,
                'googleId': google_uid,
                'profilePicture': picture,
                'userType': 'user',  # Default to user type
                'beneficiaryCategory': 'maternity',  # Temporary default - user will select
                'isFirstLogin': True,
                'profileCompleted': False,
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow(),
                'lastLogin': datetime.utcnow(),
                'isActive': True,
                'authProvider': 'google'
            }
            
            # Insert user
            result = users_collection.insert_one(user_doc)
            
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

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Remove sensitive information
        user.pop('password', None)
        user['id'] = str(user['_id'])
        user.pop('_id', None)
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Remove fields that shouldn't be updated via this endpoint
        protected_fields = ['_id', 'email', 'password', 'userType', 'createdAt']
        for field in protected_fields:
            data.pop(field, None)
        
        # Add updated timestamp
        data['updatedAt'] = datetime.utcnow()
        
        # Update user
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authorization token is required'}), 401

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)