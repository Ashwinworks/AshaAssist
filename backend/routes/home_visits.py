"""
Home Visits management routes
ASHA workers can record home visits with geotagged photos
Admins can monitor and verify visits
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
from werkzeug.utils import secure_filename
import os

home_visits_bp = Blueprint('home_visits', __name__)

UPLOAD_FOLDER = 'uploads/visit_photos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'heic', 'heif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_home_visits_routes(app, collections):
    """Initialize home visits routes with dependencies"""
    
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    @home_visits_bp.route('/api/home-visits/users', methods=['GET'])
    @jwt_required()
    def get_users_for_visits():
        """Get all maternity and palliative users for ASHA worker to visit"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            if user_type != 'asha_worker':
                return jsonify({'error': 'Only ASHA workers can access this'}), 403
            
            current_user_id = get_jwt_identity()
            asha_worker = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            
            if not asha_worker:
                return jsonify({'error': 'ASHA worker not found'}), 404
            
            ward = asha_worker.get('ward', 'Ward 1')
            
            # Get all maternity and palliative users (ward filter optional since users may not have ward set)
            query = {
                'userType': 'user',
                'beneficiaryCategory': {'$in': ['maternity', 'palliative']},
                'isActive': True
            }
            
            # Only filter by ward if users have ward field
            # For now, get all active maternity/palliative users
            users = list(collections['users'].find(query))
            
            # Get last visit for each user
            user_list = []
            for user in users:
                user_id_str = str(user['_id'])
                
                # Find last visit
                last_visit = collections['home_visits'].find_one(
                    {'userId': user_id_str},
                    sort=[('visitDate', -1)]
                )
                
                user_data = {
                    'id': user_id_str,
                    'name': user.get('name'),
                    'email': user.get('email'),
                    'phone': user.get('phone'),
                    'category': user.get('beneficiaryCategory'),
                    'ward': user.get('ward'),
                    'address': user.get('address', 'Not provided'),
                    'lastVisitDate': last_visit['visitDate'].isoformat() if last_visit else None,
                    'lastVisitId': str(last_visit['_id']) if last_visit else None,
                    'totalVisits': collections['home_visits'].count_documents({'userId': user_id_str})
                }
                user_list.append(user_data)
            
            # Sort by last visit date (overdue first)
            user_list.sort(key=lambda x: x['lastVisitDate'] or '1900-01-01')
            
            return jsonify({'users': user_list}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to load users: {str(e)}'}), 500

    @home_visits_bp.route('/api/home-visits', methods=['POST'])
    @jwt_required()
    def record_visit():
        """Record a home visit with geotagged photo"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            if user_type != 'asha_worker':
                return jsonify({'error': 'Only ASHA workers can record visits'}), 403
            
            current_user_id = get_jwt_identity()
            
            # Get form data
            user_id = request.form.get('userId')
            visit_notes = request.form.get('visitNotes', '').strip()
            latitude = request.form.get('latitude')
            longitude = request.form.get('longitude')
            
            if not user_id:
                return jsonify({'error': 'User ID is required'}), 400
            
            if not visit_notes:
                return jsonify({'error': 'Visit notes are required'}), 400
            
            # Handle photo upload
            photo_url = None
            if 'photo' in request.files:
                file = request.files['photo']
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(f"{user_id}_{datetime.now().timestamp()}_{file.filename}")
                    filepath = os.path.join(UPLOAD_FOLDER, filename)
                    file.save(filepath)
                    photo_url = f'/uploads/visit_photos/{filename}'
            
            if not photo_url:
                return jsonify({'error': 'Geotagged photo is required'}), 400
            
            # Get user details
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Create visit record
            visit_doc = {
                'userId': user_id,
                'userName': user.get('name'),
                'userCategory': user.get('beneficiaryCategory'),
                'userWard': user.get('ward'),
                'ashaWorkerId': current_user_id,
                'visitDate': datetime.now(timezone.utc),
                'visitNotes': visit_notes,
                'gpsLocation': {
                    'latitude': float(latitude) if latitude else None,
                    'longitude': float(longitude) if longitude else None
                },
                'photoUrl': photo_url,
                'status': 'completed',
                'verified': False,
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc)
            }
            
            result = collections['home_visits'].insert_one(visit_doc)
            
            return jsonify({
                'message': 'Visit recorded successfully',
                'visitId': str(result.inserted_id)
            }), 201
            
        except Exception as e:
            return jsonify({'error': f'Failed to record visit: {str(e)}'}), 500

    @home_visits_bp.route('/api/home-visits/my-visits', methods=['GET'])
    @jwt_required()
    def get_my_visits():
        """Get visits recorded by current ASHA worker"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            if user_type != 'asha_worker':
                return jsonify({'error': 'Only ASHA workers can access this'}), 403
            
            current_user_id = get_jwt_identity()
            
            # Get query parameters
            user_id = request.args.get('userId')
            date_from = request.args.get('dateFrom')
            date_to = request.args.get('dateTo')
            
            query = {'ashaWorkerId': current_user_id}
            
            if user_id:
                query['userId'] = user_id
            
            if date_from:
                query['visitDate'] = {'$gte': datetime.fromisoformat(date_from)}
            
            if date_to:
                if 'visitDate' in query:
                    query['visitDate']['$lte'] = datetime.fromisoformat(date_to)
                else:
                    query['visitDate'] = {'$lte': datetime.fromisoformat(date_to)}
            
            visits = list(collections['home_visits'].find(query).sort('visitDate', -1))
            
            # Convert ObjectId to string
            for visit in visits:
                visit['_id'] = str(visit['_id'])
                visit['visitDate'] = visit['visitDate'].isoformat() if visit.get('visitDate') else None
                visit['createdAt'] = visit['createdAt'].isoformat() if visit.get('createdAt') else None
                visit['updatedAt'] = visit['updatedAt'].isoformat() if visit.get('updatedAt') else None
            
            return jsonify({'visits': visits}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to load visits: {str(e)}'}), 500

    @home_visits_bp.route('/api/home-visits/all', methods=['GET'])
    @jwt_required()
    def get_all_visits():
        """Get all visits for admin monitoring"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            if user_type != 'admin':
                return jsonify({'error': 'Only admins can access this'}), 403
            
            # Get query parameters
            asha_worker_id = request.args.get('ashaWorkerId')
            user_category = request.args.get('userCategory')
            verified = request.args.get('verified')
            date_from = request.args.get('dateFrom')
            date_to = request.args.get('dateTo')
            
            query = {}
            
            if asha_worker_id:
                query['ashaWorkerId'] = asha_worker_id
            
            if user_category:
                query['userCategory'] = user_category
            
            if verified is not None:
                query['verified'] = verified.lower() == 'true'
            
            if date_from:
                query['visitDate'] = {'$gte': datetime.fromisoformat(date_from)}
            
            if date_to:
                if 'visitDate' in query:
                    query['visitDate']['$lte'] = datetime.fromisoformat(date_to)
                else:
                    query['visitDate'] = {'$lte': datetime.fromisoformat(date_to)}
            
            visits = list(collections['home_visits'].find(query).sort('visitDate', -1).limit(100))
            
            # Get ASHA worker names
            for visit in visits:
                visit['_id'] = str(visit['_id'])
                visit['visitDate'] = visit['visitDate'].isoformat() if visit.get('visitDate') else None
                visit['createdAt'] = visit['createdAt'].isoformat() if visit.get('createdAt') else None
                visit['updatedAt'] = visit['updatedAt'].isoformat() if visit.get('updatedAt') else None
                
                # Get ASHA worker name
                asha_worker = collections['users'].find_one({'_id': ObjectId(visit['ashaWorkerId'])})
                visit['ashaWorkerName'] = asha_worker.get('name') if asha_worker else 'Unknown'
            
            return jsonify({'visits': visits}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to load visits: {str(e)}'}), 500

    @home_visits_bp.route('/api/home-visits/<visit_id>/verify', methods=['PUT'])
    @jwt_required()
    def verify_visit(visit_id):
        """Admin verifies a visit"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            if user_type != 'admin':
                return jsonify({'error': 'Only admins can verify visits'}), 403
            
            data = request.get_json() or {}
            verified = data.get('verified', True)
            admin_notes = data.get('adminNotes', '')
            
            update_data = {
                'verified': verified,
                'adminNotes': admin_notes,
                'verifiedAt': datetime.now(timezone.utc),
                'verifiedBy': get_jwt_identity(),
                'updatedAt': datetime.now(timezone.utc)
            }
            
            result = collections['home_visits'].update_one(
                {'_id': ObjectId(visit_id)},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return jsonify({'error': 'Visit not found'}), 404
            
            return jsonify({'message': 'Visit verification updated'}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to verify visit: {str(e)}'}), 500

    @home_visits_bp.route('/api/home-visits/stats', methods=['GET'])
    @jwt_required()
    def get_visit_stats():
        """Get visit statistics for admin dashboard"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            if user_type != 'admin':
                return jsonify({'error': 'Only admins can access statistics'}), 403
            
            # Total visits this month
            now = datetime.now(timezone.utc)
            month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
            
            total_visits = collections['home_visits'].count_documents({
                'visitDate': {'$gte': month_start}
            })
            
            verified_visits = collections['home_visits'].count_documents({
                'visitDate': {'$gte': month_start},
                'verified': True
            })
            
            pending_verification = collections['home_visits'].count_documents({
                'verified': False
            })
            
            # Visits by category
            maternity_visits = collections['home_visits'].count_documents({
                'visitDate': {'$gte': month_start},
                'userCategory': 'maternity'
            })
            
            palliative_visits = collections['home_visits'].count_documents({
                'visitDate': {'$gte': month_start},
                'userCategory': 'palliative'
            })
            
            return jsonify({
                'totalVisitsThisMonth': total_visits,
                'verifiedVisits': verified_visits,
                'pendingVerification': pending_verification,
                'maternityVisits': maternity_visits,
                'palliativeVisits': palliative_visits
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to load statistics: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(home_visits_bp)
