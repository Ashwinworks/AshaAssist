"""
Authentication service for user management
"""
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from flask_jwt_extended import create_access_token
from firebase_admin import auth as firebase_auth
from utils.validators import validate_email, validate_phone, validate_user_type, validate_beneficiary_category
from utils.helpers import normalize_inputs

class AuthService:
    def __init__(self, users_collection):
        self.users_collection = users_collection

    def create_firebase_user(self, email, password=None, display_name=None):
        """Create a user in Firebase Auth"""
        try:
            user_data = {
                'email': email,
                'email_verified': False,
                'display_name': display_name,
            }

            if password:
                user_data['password'] = password

            firebase_user = firebase_auth.create_user(**user_data)
            return firebase_user.uid
        except Exception as e:
            print(f"Failed to create Firebase user: {e}")
            return None

    def migrate_user_to_firebase(self, user_id, password):
        """Migrate an existing MongoDB user to Firebase Auth"""
        try:
            user = self.users_collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                return False, "User not found"

            if user.get('firebaseUid'):
                return True, "User already migrated to Firebase"

            # Create Firebase user
            firebase_uid = self.create_firebase_user(
                email=user['email'],
                password=password,
                display_name=user.get('name')
            )

            if firebase_uid:
                # Update MongoDB user with Firebase UID
                self.users_collection.update_one(
                    {'_id': ObjectId(user_id)},
                    {'$set': {
                        'firebaseUid': firebase_uid,
                        'authProvider': 'firebase',
                        'updatedAt': datetime.now(timezone.utc)
                    }}
                )
                return True, "User migrated to Firebase successfully"
            else:
                return False, "Failed to create Firebase user"

        except Exception as e:
            return False, f"Migration failed: {str(e)}"

    def register_user(self, data):
        """Register a new user"""
        # Normalize inputs
        data = normalize_inputs(data, ['email', 'phone'])
        
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'phone', 'userType', 'beneficiaryCategory']
        for field in required_fields:
            if field not in data or not data[field]:
                return {'error': f'{field} is required'}, 400
        
        # Validate email format
        if not validate_email(data['email']):
            return {'error': 'Invalid email format'}, 400
        
        # Validate phone format
        if not validate_phone(data['phone']):
            return {'error': 'Invalid phone number format'}, 400
        
        # Restrict registration to users only
        if data['userType'] not in ['user']:
            return {
                'error': 'Registration is only allowed for families/individuals. ASHA workers and admins have pre-defined accounts.',
                'message': 'Please contact your local health department for ASHA worker or admin access.'
            }, 403
        
        # Validate beneficiary category for users
        if data['userType'] == 'user' and data['beneficiaryCategory'] not in ['maternity', 'palliative']:
            return {'error': 'Invalid beneficiary category'}, 400
        
        # Check if user already exists (email)
        existing_user = self.users_collection.find_one({'email': data['email']})
        if existing_user:
            return {'error': 'User with this email already exists'}, 409
        
        # Check if phone already exists
        existing_phone = self.users_collection.find_one({'phone': data['phone']})
        if existing_phone:
            return {'error': 'User with this phone number already exists'}, 409
        
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        # Create Firebase user first
        firebase_uid = self.create_firebase_user(
            email=data['email'],
            password=data['password'],  # Use original password for Firebase
            display_name=data['name']
        )

        if not firebase_uid:
            return {'error': 'Failed to create user account. Please try again.'}, 500

        # Create user document
        user_doc = {
            'email': data['email'],
            'password': hashed_password,
            'name': data['name'],
            'phone': data['phone'],
            'userType': data['userType'],
            'beneficiaryCategory': data['beneficiaryCategory'] if data['userType'] == 'user' else None,
            'firebaseUid': firebase_uid,
            'authProvider': 'firebase',
            'isFirstLogin': True,
            'profileCompleted': False,
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc),
            'isActive': True
        }

        # Insert user
        try:
            result = self.users_collection.insert_one(user_doc)
        except DuplicateKeyError as e:
            # If MongoDB insertion fails, try to delete the Firebase user
            try:
                firebase_auth.delete_user(firebase_uid)
            except:
                pass  # Ignore Firebase cleanup errors

            # Determine which field caused the duplicate key
            error_text = str(e)
            field = 'email' if 'email' in error_text else ('phone' if 'phone' in error_text else 'field')
            return {'error': f'User with this {field} already exists'}, 409

        # Create access token
        access_token = create_access_token(
            identity=str(result.inserted_id),
            additional_claims={
                'userType': data['userType'],
                'beneficiaryCategory': data.get('beneficiaryCategory') if data['userType'] == 'user' else None,
                'email': data['email'],
                'name': data['name']
            }
        )

        return {
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
        }, 201

    def login_user(self, data):
        """Authenticate user login"""
        # Normalize inputs
        data = normalize_inputs(data, ['email'])
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return {'error': 'Email and password are required'}, 400
        
        # Find user
        user = self.users_collection.find_one({'email': data['email']})
        if not user:
            return {'error': 'Invalid email or password'}, 401
        
        # Check password
        if not check_password_hash(user['password'], data['password']):
            return {'error': 'Invalid email or password'}, 401
        
        # Check if user is active
        if not user.get('isActive', True):
            return {'error': 'Account is deactivated'}, 401
        
        # Create access token
        access_token = create_access_token(
            identity=str(user['_id']),
            additional_claims={
                'userType': user['userType'],
                'beneficiaryCategory': user.get('beneficiaryCategory'),
                'email': user['email'],
                'name': user['name']
            }
        )
        
        # Update last login
        self.users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'lastLogin': datetime.now(timezone.utc)}}
        )
        
        return {
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
        }, 200

    def create_default_accounts(self):
        """Create default ASHA worker, admin, and Anganvaadi accounts if they don't exist"""
        try:
            # Check if ASHA worker exists
            asha_exists = self.users_collection.find_one({"email": "asha@gmail.com"})
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
                    "createdAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc)
                }
                self.users_collection.insert_one(asha_account)
                print("✓ Default ASHA worker account created: asha@gmail.com / asha123")

            # Check if Anganvaadi worker exists
            anganvaadi_exists = self.users_collection.find_one({"email": "anganvaadi@gmail.com"})
            if not anganvaadi_exists:
                anganvaadi_account = {
                    "name": "Anganvaadi Worker - Ward 1",
                    "email": "anganvaadi@gmail.com",
                    "phone": "9876543212",
                    "password": generate_password_hash("anganvaadi123"),
                    "userType": "anganvaadi",
                    "ward": "Ward 1",
                    "center": "Anganvaadi Center - Ward 1",
                    "isActive": True,
                    "isFirstLogin": True,
                    "createdAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc)
                }
                self.users_collection.insert_one(anganvaadi_account)
                print("✓ Default Anganvaadi worker account created: anganvaadi@gmail.com / anganvaadi123")

            # Check if admin exists
            admin_exists = self.users_collection.find_one({"email": "admin@example.com"})
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
                    "createdAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc)
                }
                self.users_collection.insert_one(admin_account)
                print("✓ Default admin account created: admin@example.com / admin123")

        except Exception as e:
            print(f"Error creating default accounts: {e}")
