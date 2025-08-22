




from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
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
visits_collection = db.visits
asha_feedback_collection = db.asha_feedback
calendar_events_collection = db.calendar_events
health_blogs_collection = db.health_blogs

# Ensure indexes
try:
    # Users: unique email and partial unique phone
    users_collection.create_index([('email', 1)], unique=True)
    indexes = users_collection.index_information()
    if 'phone_1' in indexes:
        users_collection.drop_index('phone_1')
    users_collection.create_index(
        [('phone', 1)],
        unique=True,
        partialFilterExpression={'phone': {'$exists': True, '$type': 'string'}}
    )
    # ASHA feedback: index by user and createdAt for listing
    asha_feedback_collection.create_index([('userId', 1), ('createdAt', -1)])

    # Calendar events: by start/end for range queries, and createdBy
    calendar_events_collection.create_index([('start', 1)])
    calendar_events_collection.create_index([('end', 1)])
    calendar_events_collection.create_index([('createdBy', 1)])

    # Health blogs: indexes for author, category, createdAt, status
    health_blogs_collection.create_index([('createdBy', 1), ('createdAt', -1)])
    health_blogs_collection.create_index([('category', 1), ('status', 1)])
    health_blogs_collection.create_index([('status', 1), ('createdAt', -1)])
    print("Indexes ensured: users(email unique, phone partial unique), asha_feedback(userId+createdAt), calendar_events(start,end,createdBy), health_blogs(createdBy+createdAt, category+status, status+createdAt)")
except Exception as e:
    print(f'Warning: could not ensure indexes: {e}')

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
        
        # Normalize inputs for registration
        if 'email' in data and isinstance(data['email'], str):
            data['email'] = data['email'].strip().lower()
        if 'phone' in data and isinstance(data['phone'], str):
            data['phone'] = data['phone'].strip()
        
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
        
        # Check if user already exists (email)
        existing_user = users_collection.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Check if phone already exists
        existing_phone = users_collection.find_one({'phone': data['phone']})
        if existing_phone:
            return jsonify({'error': 'User with this phone number already exists'}), 409
        
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
        try:
            result = users_collection.insert_one(user_doc)
        except DuplicateKeyError as e:
            # Determine which field caused the duplicate key
            error_text = str(e)
            field = 'email' if 'email' in error_text else ('phone' if 'phone' in error_text else 'field')
            return jsonify({'error': f'User with this {field} already exists'}), 409
        
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
        
        # Normalize inputs for login
        if 'email' in data and isinstance(data['email'], str):
            data['email'] = data['email'].strip().lower()
        
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
            email = (decoded_token.get('email') or '').strip().lower()
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

# ---------------------------
# Maternity (Antenatal) APIs
# ---------------------------
def _ensure_maternity_user(user):
    """Validate that user is a maternal beneficiary user."""
    if not user:
        return 'User not found', 404
    if user.get('userType') != 'user' or user.get('beneficiaryCategory') != 'maternity':
        return 'Only maternal users can access this endpoint', 403
    return None, 200

def _parse_date(date_str):
    """Parse an ISO or YYYY-MM-DD string to a datetime (00:00:00)."""
    try:
        dt = datetime.fromisoformat(date_str)
        # Normalize to date boundary if time part present
        return datetime(dt.year, dt.month, dt.day)
    except Exception:
        return None

def _calc_edd_from_lmp(lmp_dt):
    return lmp_dt + timedelta(days=280)

def _calc_lmp_from_edd(edd_dt):
    return edd_dt - timedelta(days=280)

def _gestational_week(lmp_dt, at_date):
    """Return integer gestational week (0..42) from LMP at given date."""
    if not lmp_dt:
        return None
    days = (at_date - lmp_dt).days
    if days < 0:
        return 0
    return days // 7

def _build_schedule(lmp_dt, visits):
    """Build recommended visit schedule with status per week.
    visits: list of dicts with 'visitDate' (datetime) and 'week' (int)
    """
    if not lmp_dt:
        return {'error': 'LMP not set', 'schedule': []}
    # Define schedule weeks per guideline
    weeks = list(range(4, 29, 4)) + [30, 32, 34, 36] + [37, 38, 39, 40] + [41, 42]
    # Map completed weeks from recorded visits
    completed_weeks = set()
    for v in (visits or []):
        if isinstance(v, dict) and isinstance(v.get('week'), int):
            completed_weeks.add(v['week'])
    today = datetime.utcnow()
    schedule = []
    for w in weeks:
        sched_date = lmp_dt + timedelta(weeks=w)
        status = 'done' if w in completed_weeks else ('overdue' if sched_date.date() < today.date() else 'upcoming')
        schedule.append({
            'week': w,
            'scheduledDate': sched_date,
            'status': status,
            'optional': True if w in [41, 42] else False
        })
    return {'schedule': schedule}

@app.route('/api/maternity/profile', methods=['PUT'])
@jwt_required()
def set_maternity_profile():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        err, code = _ensure_maternity_user(user)
        if err:
            return jsonify({'error': err}), code
        data = request.get_json() or {}
        lmp_str = data.get('lmpDate')
        edd_str = data.get('eddDate')
        lmp_dt = _parse_date(lmp_str) if lmp_str else None
        edd_dt = _parse_date(edd_str) if edd_str else None
        if not lmp_dt and not edd_dt:
            return jsonify({'error': 'Provide at least lmpDate or eddDate (YYYY-MM-DD)'}), 400
        if lmp_dt and not edd_dt:
            edd_dt = _calc_edd_from_lmp(lmp_dt)
        if edd_dt and not lmp_dt:
            lmp_dt = _calc_lmp_from_edd(edd_dt)
        update = {
            'maternityProfile': {
                'lmpDate': lmp_dt,
                'eddDate': edd_dt,
                'updatedAt': datetime.utcnow()
            },
            'updatedAt': datetime.utcnow()
        }
        users_collection.update_one({'_id': ObjectId(user_id)}, {'$set': update})
        return jsonify({'message': 'Maternity profile updated', 'maternityProfile': update['maternityProfile']}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update maternity profile: {str(e)}'}), 500

@app.route('/api/maternity/visits', methods=['GET'])
@jwt_required()
def get_maternity_visits():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        err, code = _ensure_maternity_user(user)
        if err:
            return jsonify({'error': err}), code
        # Fetch from visits collection
        cursor = visits_collection.find({'userId': ObjectId(user_id)}).sort('visitDate', 1)
        visits = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['userId'] = str(doc['userId'])
            visits.append(doc)
        return jsonify({'visits': visits}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch visits: {str(e)}'}), 500

@app.route('/api/maternity/visits', methods=['POST'])
@jwt_required()
def add_maternity_visit():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        err, code = _ensure_maternity_user(user)
        if err:
            return jsonify({'error': err}), code
        data = request.get_json() or {}
        visit_date_str = data.get('visitDate')
        provided_week = data.get('week')
        if not visit_date_str:
            return jsonify({'error': 'visitDate (YYYY-MM-DD) is required'}), 400
        visit_dt = _parse_date(visit_date_str)
        if not visit_dt:
            return jsonify({'error': 'Invalid visitDate format. Use YYYY-MM-DD'}), 400
        lmp_dt = None
        if user.get('maternityProfile') and user['maternityProfile'].get('lmpDate'):
            # Stored as datetime already
            lmp_dt = user['maternityProfile']['lmpDate']
        computed_week = _gestational_week(lmp_dt, visit_dt) if lmp_dt else None
        week = int(provided_week) if provided_week is not None else computed_week
        visit_doc = {
            'userId': ObjectId(user_id),
            'visitDate': visit_dt,
            'week': week,
            'center': (data.get('center') or '').strip(),
            'notes': (data.get('notes') or '').strip(),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        result = visits_collection.insert_one(visit_doc)
        visit_doc['_id'] = str(result.inserted_id)
        visit_doc['userId'] = str(visit_doc['userId'])
        return jsonify({'message': 'Visit recorded', 'visit': visit_doc}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to add visit: {str(e)}'}), 500

@app.route('/api/maternity/visits/<visit_id>', methods=['DELETE'])
@jwt_required()
def delete_maternity_visit(visit_id):
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        err, code = _ensure_maternity_user(user)
        if err:
            return jsonify({'error': err}), code
        # Delete visit document owned by the user
        result = visits_collection.delete_one({'_id': ObjectId(visit_id), 'userId': ObjectId(user_id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Visit not found'}), 404
        return jsonify({'message': 'Visit deleted'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to delete visit: {str(e)}'}), 500

@app.route('/api/maternity/schedule', methods=['GET'])
@jwt_required()
def get_maternity_schedule():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        err, code = _ensure_maternity_user(user)
        if err:
            return jsonify({'error': err}), code
        lmp_dt = None
        if user.get('maternityProfile') and user['maternityProfile'].get('lmpDate'):
            lmp_dt = user['maternityProfile']['lmpDate']
        visits = user.get('antenatalVisits', [])
        result = _build_schedule(lmp_dt, visits)
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch schedule: {str(e)}'}), 500

# ---------------------------
# Calendar Events APIs (managed by ASHA worker)
# ---------------------------
@app.route('/api/calendar-events', methods=['GET'])
@jwt_required()
def list_calendar_events():
    try:
        # Optional month filter: ?month=YYYY-MM
        month = request.args.get('month')
        query = {}
        if month:
            try:
                year, mon = map(int, month.split('-'))
                start = datetime(year, mon, 1)
                # next month
                if mon == 12:
                    end = datetime(year + 1, 1, 1)
                else:
                    end = datetime(year, mon + 1, 1)
                query = {'start': {'$lt': end}, 'end': {'$gte': start}}
            except Exception:
                pass
        cursor = calendar_events_collection.find(query).sort('start', 1)
        events = []
        for doc in cursor:
            events.append({
                'id': str(doc['_id']),
                'title': doc.get('title', ''),
                'description': doc.get('description', ''),
                'place': doc.get('place', ''),
                'start': doc.get('start').isoformat() if isinstance(doc.get('start'), datetime) else doc.get('start'),
                'end': doc.get('end').isoformat() if isinstance(doc.get('end'), datetime) else doc.get('end'),
                'allDay': bool(doc.get('allDay', False)),
                'category': doc.get('category', ''),
                'createdBy': str(doc.get('createdBy')) if doc.get('createdBy') else None,
                'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
            })
        return jsonify({'events': events}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load events: {str(e)}'}), 500

@app.route('/api/calendar-events', methods=['POST'])
@jwt_required()
def create_calendar_event():
    try:
        claims = get_jwt() or {}
        if claims.get('userType') not in ['asha_worker', 'admin']:
            return jsonify({'error': 'Only ASHA workers or admins can manage events'}), 403
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        title = (data.get('title') or '').strip()
        start = data.get('start')
        end = data.get('end') or start
        if not title or not start:
            return jsonify({'error': 'Title and start are required'}), 400
        # Parse dates
        def parse_dt(val):
            if isinstance(val, str):
                try:
                    return datetime.fromisoformat(val.replace('Z', '+00:00'))
                except Exception:
                    pass
            return None
        start_dt = parse_dt(start)
        end_dt = parse_dt(end)
        if not start_dt or not end_dt:
            return jsonify({'error': 'Invalid start/end datetime'}), 400
        doc = {
            'title': title,
            'description': (data.get('description') or '').strip(),
            'place': (data.get('place') or '').strip(),
            'start': start_dt,
            'end': end_dt,
            'allDay': bool(data.get('allDay', False)),
            'category': (data.get('category') or '').strip(),
            'createdBy': ObjectId(user_id),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        res = calendar_events_collection.insert_one(doc)
        return jsonify({'id': str(res.inserted_id), 'message': 'Event created'}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to create event: {str(e)}'}), 500

@app.route('/api/calendar-events/<event_id>', methods=['PUT'])
@jwt_required()
def update_calendar_event(event_id):
    try:
        claims = get_jwt() or {}
        if claims.get('userType') not in ['asha_worker', 'admin']:
            return jsonify({'error': 'Only ASHA workers or admins can manage events'}), 403
        data = request.get_json() or {}
        updates = {}
        for field in ['title', 'description', 'place', 'category']:
            if field in data:
                updates[field] = (data.get(field) or '').strip()
        def parse_dt(val):
            if isinstance(val, str):
                try:
                    return datetime.fromisoformat(val.replace('Z', '+00:00'))
                except Exception:
                    pass
            return None
        if 'start' in data:
            dt = parse_dt(data['start'])
            if not dt: return jsonify({'error': 'Invalid start'}), 400
            updates['start'] = dt
        if 'end' in data:
            dt = parse_dt(data['end'])
            if not dt: return jsonify({'error': 'Invalid end'}), 400
            updates['end'] = dt
        if 'allDay' in data:
            updates['allDay'] = bool(data['allDay'])
        if not updates:
            return jsonify({'error': 'No updates provided'}), 400
        updates['updatedAt'] = datetime.utcnow()
        calendar_events_collection.update_one({'_id': ObjectId(event_id)}, {'$set': updates})
        return jsonify({'message': 'Event updated'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update event: {str(e)}'}), 500

@app.route('/api/calendar-events/<event_id>', methods=['DELETE'])
@jwt_required()
def delete_calendar_event(event_id):
    try:
        claims = get_jwt() or {}
        if claims.get('userType') not in ['asha_worker', 'admin']:
            return jsonify({'error': 'Only ASHA workers or admins can manage events'}), 403
        calendar_events_collection.delete_one({'_id': ObjectId(event_id)})
        return jsonify({'message': 'Event deleted'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to delete event: {str(e)}'}), 500

# ---------------------------
# ASHA Feedback APIs
# ---------------------------
@app.route('/api/asha-feedback', methods=['POST'])
@jwt_required()
def submit_asha_feedback():
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        # Basic validation
        rating = int(data.get('rating', 0))
        if rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        feedback_doc = {
            'userId': ObjectId(user_id),
            'ashaWorkerId': data.get('ashaWorkerId'),  # optional for now
            'rating': rating,
            'timeliness': int(data.get('timeliness', rating)),
            'communication': int(data.get('communication', rating)),
            'supportiveness': int(data.get('supportiveness', rating)),
            'comments': (data.get('comments') or '').strip(),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        result = asha_feedback_collection.insert_one(feedback_doc)
        return jsonify({'message': 'Feedback submitted', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to submit feedback: {str(e)}'}), 500

@app.route('/api/asha-feedback', methods=['GET'])
@jwt_required()
def list_my_asha_feedback():
    try:
        user_id = get_jwt_identity()
        cursor = asha_feedback_collection.find({'userId': ObjectId(user_id)}).sort('createdAt', -1)
        items = []
        for doc in cursor:
            doc['id'] = str(doc['_id'])
            doc.pop('_id', None)
            doc['userId'] = str(doc['userId'])
            items.append(doc)
        return jsonify({'feedbacks': items}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load feedback: {str(e)}'}), 500

@app.route('/api/admin/asha-feedback', methods=['GET'])
@jwt_required()
def admin_list_all_asha_feedback():
    try:
        claims = get_jwt() or {}
        if claims.get('userType') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        # Fetch with user basics
        pipeline = [
            { '$sort': { 'createdAt': -1 } },
            { '$lookup': { 'from': 'users', 'localField': 'userId', 'foreignField': '_id', 'as': 'user' } },
            { '$unwind': { 'path': '$user', 'preserveNullAndEmptyArrays': True } },
            { '$project': {
                'id': { '$toString': '$_id' },
                '_id': 0,
                'userId': { '$toString': '$userId' },
                'userName': { '$ifNull': ['$user.name', ''] },
                'userEmail': { '$ifNull': ['$user.email', ''] },
                'beneficiaryCategory': { '$ifNull': ['$user.beneficiaryCategory', ''] },
                'rating': 1,
                'timeliness': 1,
                'communication': 1,
                'supportiveness': 1,
                'comments': 1,
                'ashaWorkerId': 1,
                'createdAt': 1
            }}
        ]
        results = list(asha_feedback_collection.aggregate(pipeline))
        # Convert datetimes
        for r in results:
            if isinstance(r.get('createdAt'), datetime):
                r['createdAt'] = r['createdAt'].isoformat()
        return jsonify({'feedbacks': results}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load all feedback: {str(e)}'}), 500

# ---------------------------
# Health Blogs APIs
# ---------------------------
@app.route('/api/health-blogs', methods=['POST'])
@jwt_required()
def create_health_blog():
    try:
        user_id = get_jwt_identity()
        claims = get_jwt() or {}
        if claims.get('userType') not in ['asha_worker', 'admin']:
            return jsonify({'error': 'Only ASHA workers or admins can create blogs'}), 403

        # Support both JSON and multipart (for image upload)
        data = {}
        if request.content_type and 'multipart/form-data' in request.content_type:
            data['title'] = (request.form.get('title') or '').strip()
            data['content'] = (request.form.get('content') or '').strip()
            data['category'] = (request.form.get('category') or 'general').strip().lower()
            data['authorName'] = (request.form.get('authorName') or '').strip()
            image_file = request.files.get('image')
        else:
            data = request.get_json() or {}
            image_file = None

        # Validate required fields
        if not data.get('title') or not data.get('content') or not data.get('authorName'):
            return jsonify({'error': 'title, content, and authorName are required'}), 400

        # Save image if provided
        image_url = None
        if image_file:
            uploads_dir = os.path.join(os.getcwd(), 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            # Create unique filename
            ts = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
            ext = os.path.splitext(image_file.filename)[1]
            filename = f"blog_{ts}{ext}"
            save_path = os.path.join(uploads_dir, filename)
            image_file.save(save_path)
            image_url = f"/uploads/{filename}"

        doc = {
            'title': data['title'].strip(),
            'content': data['content'].strip(),
            'category': (data.get('category') or 'general').strip().lower(),
            'authorName': data['authorName'].strip(),
            'imageUrl': image_url,
            'status': (data.get('status') or 'published').strip().lower(),  # published|draft
            'createdBy': ObjectId(user_id),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow(),
            'views': 0,
            'likes': 0,
            'tags': data.get('tags') or []
        }
        result = health_blogs_collection.insert_one(doc)
        return jsonify({'message': 'Blog created', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to create blog: {str(e)}'}), 500

@app.route('/api/health-blogs', methods=['GET'])
@jwt_required()
def list_health_blogs():
    try:
        claims = get_jwt() or {}
        user_type = claims.get('userType')
        # filters
        category = (request.args.get('category') or '').strip().lower() or None
        status = (request.args.get('status') or '').strip().lower() or None
        created_by = (request.args.get('createdBy') or '').strip() or None

        query = {}
        if category:
            query['category'] = category
        if status:
            query['status'] = status
        else:
            # Default for non-admin/non-asha: show published only
            if user_type not in ['admin', 'asha_worker']:
                query['status'] = 'published'
        if created_by:
            try:
                query['createdBy'] = ObjectId(created_by)
            except Exception:
                pass

        cursor = health_blogs_collection.find(query).sort('createdAt', -1)
        items = []
        for doc in cursor:
            doc['id'] = str(doc['_id'])
            doc.pop('_id', None)
            doc['createdBy'] = str(doc['createdBy'])
            if isinstance(doc.get('createdAt'), datetime):
                doc['createdAt'] = doc['createdAt'].isoformat()
            if isinstance(doc.get('updatedAt'), datetime):
                doc['updatedAt'] = doc['updatedAt'].isoformat()
            items.append(doc)
        return jsonify({'blogs': items}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to list blogs: {str(e)}'}), 500

@app.route('/api/health-blogs/<blog_id>', methods=['GET'])
@jwt_required()
def get_health_blog(blog_id):
    try:
        claims = get_jwt() or {}
        user_type = claims.get('userType')
        doc = health_blogs_collection.find_one({'_id': ObjectId(blog_id)})
        if not doc:
            return jsonify({'error': 'Blog not found'}), 404
        # Restrict access: non-admin/non-asha can only read published
        if user_type not in ['admin', 'asha_worker'] and doc.get('status') != 'published':
            return jsonify({'error': 'Not allowed'}), 403
        doc['id'] = str(doc['_id'])
        doc.pop('_id', None)
        doc['createdBy'] = str(doc['createdBy'])
        if isinstance(doc.get('createdAt'), datetime):
            doc['createdAt'] = doc['createdAt'].isoformat()
        if isinstance(doc.get('updatedAt'), datetime):
            doc['updatedAt'] = doc['updatedAt'].isoformat()
        return jsonify({'blog': doc}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get blog: {str(e)}'}), 500

@app.route('/api/health-blogs/<blog_id>', methods=['PUT'])
@jwt_required()
def update_health_blog(blog_id):
    try:
        user_id = get_jwt_identity()
        claims = get_jwt() or {}
        is_admin = claims.get('userType') == 'admin'
        data = request.get_json() or {}

        # Only creator or admin can edit
        existing = health_blogs_collection.find_one({'_id': ObjectId(blog_id)})
        if not existing:
            return jsonify({'error': 'Blog not found'}), 404
        if not is_admin and str(existing['createdBy']) != str(ObjectId(user_id)):
            return jsonify({'error': 'Not allowed'}), 403

        update = {k: v for k, v in {
            'title': data.get('title'),
            'content': data.get('content'),
            'category': (data.get('category') or '').strip().lower() if data.get('category') else None,
            'authorName': data.get('authorName'),
            'status': (data.get('status') or '').strip().lower() if data.get('status') else None,
            'tags': data.get('tags')
        }.items() if v is not None}
        update['updatedAt'] = datetime.utcnow()
        health_blogs_collection.update_one({'_id': ObjectId(blog_id)}, {'$set': update})
        return jsonify({'message': 'Blog updated'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update blog: {str(e)}'}), 500

@app.route('/api/health-blogs/<blog_id>', methods=['DELETE'])
@jwt_required()
def delete_health_blog(blog_id):
    try:
        user_id = get_jwt_identity()
        claims = get_jwt() or {}
        is_admin = claims.get('userType') == 'admin'
        existing = health_blogs_collection.find_one({'_id': ObjectId(blog_id)})
        if not existing:
            return jsonify({'error': 'Blog not found'}), 404
        if not is_admin and str(existing['createdBy']) != str(ObjectId(user_id)):
            return jsonify({'error': 'Not allowed'}), 403
        health_blogs_collection.delete_one({'_id': ObjectId(blog_id)})
        return jsonify({'message': 'Blog deleted'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to delete blog: {str(e)}'}), 500

# Serve uploaded images
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    uploads_dir = os.path.join(os.getcwd(), 'uploads')
    return send_from_directory(uploads_dir, filename)

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