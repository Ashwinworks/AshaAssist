"""
Admin-only routes for system management
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
from utils.helpers import to_iso_string

# Create blueprint
admin_bp = Blueprint('admin', __name__)

def init_admin_routes(app, collections):
    """Initialize admin routes with dependencies"""
    
    def require_admin():
        """Check if user is admin"""
        claims = get_jwt() or {}
        if claims.get('userType') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return None

    @admin_bp.route('/api/admin/asha-feedback', methods=['GET'])
    @jwt_required()
    def admin_list_all_asha_feedback():
        """List all ASHA feedback for admin review"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check
            
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
            results = list(collections['asha_feedback'].aggregate(pipeline))
            
            # Convert datetimes
            for r in results:
                if isinstance(r.get('createdAt'), datetime):
                    r['createdAt'] = r['createdAt'].isoformat()
            
            return jsonify({'feedbacks': results}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to load all feedback: {str(e)}'}), 500

    @admin_bp.route('/api/admin/asha-overview', methods=['GET'])
    @jwt_required()
    def admin_asha_overview():
        """Get ASHA worker overview and statistics"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check
            
            # Since we have a single ASHA worker
            worker = collections['users'].find_one({'userType': 'asha_worker'})
            if not worker:
                return jsonify({'error': 'No ASHA worker found'}), 404
            
            # Feedback stats
            total_feedbacks = collections['asha_feedback'].count_documents({})
            complaints_received = collections['asha_feedback'].count_documents({'rating': {'$lte': 2}})
            avg_result = list(collections['asha_feedback'].aggregate([
                { '$group': { '_id': None, 'avgRating': { '$avg': '$rating' }, 'count': { '$sum': 1 } } }
            ]))
            avg_rating = round(float(avg_result[0]['avgRating']), 1) if avg_result else 0.0
            
            # Prepare response
            data = {
                'worker': {
                    'id': str(worker.get('_id')),
                    'name': worker.get('name'),
                    'email': worker.get('email'),
                    'phone': worker.get('phone'),
                    'ward': worker.get('ward'),
                    'isActive': bool(worker.get('isActive', True)),
                    'createdAt': to_iso_string(worker.get('createdAt')),
                    'lastLogin': to_iso_string(worker.get('lastLogin'))
                },
                'stats': {
                    'totalFeedbacks': int(total_feedbacks),
                    'averageRating': avg_rating,
                    'complaintsReceived': int(complaints_received)
                }
            }
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': f'Failed to load ASHA overview: {str(e)}'}), 500

    @admin_bp.route('/api/admin/vaccination-overview', methods=['GET'])
    @jwt_required()
    def admin_vaccination_overview():
        """Return vaccination schedules with booking stats for admin dashboard"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check

            # List schedules
            schedules_cursor = collections['vaccination_schedules'].find({}).sort('date', -1)
            schedules = list(schedules_cursor)
            if not schedules:
                return jsonify({'schedules': []}), 200

            schedule_ids = [s['_id'] for s in schedules]

            # Aggregate bookings grouped by scheduleId
            pipeline = [
                { '$match': { 'scheduleId': { '$in': schedule_ids } } },
                { '$group': {
                    '_id': '$scheduleId',
                    'total': { '$sum': 1 },
                    'byStatus': { '$push': '$status' }
                }}
            ]
            agg = list(collections['vaccination_bookings'].aggregate(pipeline))
            stats_map = {}
            for a in agg:
                counts = { 'Booked': 0, 'Completed': 0, 'Expired': 0, 'Cancelled': 0 }
                for st in a.get('byStatus', []):
                    if st in counts:
                        counts[st] += 1
                    else:
                        counts[st] = counts.get(st, 0) + 1
                stats_map[str(a['_id'])] = { 'total': int(a.get('total', 0)), **counts }

            result = []
            for s in schedules:
                sid = str(s['_id'])
                st = stats_map.get(sid, {})
                result.append({
                    'id': sid,
                    'title': s.get('title') or 'Vaccination Schedule',
                    'date': s.get('date'),
                    'time': s.get('time'),
                    'location': s.get('location'),
                    'vaccines': s.get('vaccines', []),
                    'status': s.get('status', 'Scheduled'),
                    'stats': {
                        'totalBookings': int(st.get('total', 0)),
                        'booked': int(st.get('Booked', 0)),
                        'completed': int(st.get('Completed', 0)),
                        'expired': int(st.get('Expired', 0)),
                        'cancelled': int(st.get('Cancelled', 0)),
                    }
                })

            return jsonify({ 'schedules': result }), 200
        except Exception as e:
            return jsonify({'error': f'Failed to load vaccination overview: {str(e)}'}), 500

    @admin_bp.route('/api/admin/users', methods=['GET'])
    @jwt_required()
    def admin_list_users():
        """List users with filters, pagination and search"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check

            # Filters
            q = (request.args.get('q') or '').strip()
            user_type = (request.args.get('type') or 'user').strip()
            category = (request.args.get('category') or '').strip()
            status = (request.args.get('status') or '').strip().lower()  # 'active' | 'inactive'
            try:
                page = max(int(request.args.get('page') or 1), 1)
            except Exception:
                page = 1
            try:
                page_size = int(request.args.get('pageSize') or 20)
                page_size = max(1, min(page_size, 100))
            except Exception:
                page_size = 20

            query = {'userType': user_type}
            if category:
                query['beneficiaryCategory'] = category
            if status in ['active', 'inactive']:
                query['isActive'] = (status == 'active')
            if q:
                query['$or'] = [
                    { 'name': { '$regex': q, '$options': 'i' } },
                    { 'email': { '$regex': q, '$options': 'i' } },
                    { 'phone': { '$regex': q, '$options': 'i' } }
                ]

            total = collections['users'].count_documents(query)
            cursor = (
                collections['users']
                .find(query)
                .sort('createdAt', -1)
                .skip((page - 1) * page_size)
                .limit(page_size)
            )

            users = []
            for doc in cursor:
                users.append({
                    'id': str(doc.get('_id')),
                    'name': doc.get('name'),
                    'email': doc.get('email'),
                    'phone': doc.get('phone'),
                    'userType': doc.get('userType'),
                    'beneficiaryCategory': doc.get('beneficiaryCategory'),
                    'isActive': bool(doc.get('isActive', True)),
                    'createdAt': to_iso_string(doc.get('createdAt')),
                    'lastLogin': to_iso_string(doc.get('lastLogin'))
                })

            return jsonify({
                'users': users,
                'total': int(total),
                'page': page,
                'pageSize': page_size
            }), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list users: {str(e)}'}), 500

    @admin_bp.route('/api/admin/users/<user_id>', methods=['GET'])
    @jwt_required()
    def admin_get_user(user_id):
        """Get a single user by id"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check

            try:
                _id = ObjectId(user_id)
            except Exception:
                return jsonify({'error': 'Invalid user id'}), 400

            user = collections['users'].find_one({ '_id': _id })
            if not user:
                return jsonify({'error': 'User not found'}), 404

            data = {
                'id': str(user.get('_id')),
                'name': user.get('name'),
                'email': user.get('email'),
                'phone': user.get('phone'),
                'userType': user.get('userType'),
                'beneficiaryCategory': user.get('beneficiaryCategory'),
                'isActive': bool(user.get('isActive', True)),
                'createdAt': to_iso_string(user.get('createdAt')),
                'updatedAt': to_iso_string(user.get('updatedAt')),
                'lastLogin': to_iso_string(user.get('lastLogin'))
            }
            return jsonify({'user': data}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to get user: {str(e)}'}), 500

    @admin_bp.route('/api/admin/users/<user_id>/status', methods=['PUT'])
    @jwt_required()
    def admin_update_user_status(user_id):
        """Activate/Deactivate a user"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check

            try:
                _id = ObjectId(user_id)
            except Exception:
                return jsonify({'error': 'Invalid user id'}), 400

            payload = request.get_json() or {}
            isActive = bool(payload.get('isActive'))

            res = collections['users'].update_one(
                { '_id': _id },
                { '$set': { 'isActive': isActive, 'updatedAt': datetime.now(timezone.utc) } }
            )
            if res.matched_count == 0:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({ 'message': 'Status updated', 'isActive': isActive }), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update status: {str(e)}'}), 500

    @admin_bp.route('/api/admin/users/<user_id>', methods=['PUT'])
    @jwt_required()
    def admin_update_user(user_id):
        """Update user details (limited fields)"""
        try:
            admin_check = require_admin()
            if admin_check:
                return admin_check

            try:
                _id = ObjectId(user_id)
            except Exception:
                return jsonify({'error': 'Invalid user id'}), 400

            data = request.get_json() or {}
            update = {}

            # Local import to avoid changing global imports
            from utils.validators import validate_phone, validate_beneficiary_category

            if 'name' in data:
                name = (data.get('name') or '').strip()
                if not name:
                    return jsonify({'error': 'name cannot be empty'}), 400
                update['name'] = name

            if 'phone' in data:
                phone = (data.get('phone') or '').strip()
                if phone and not validate_phone(phone):
                    return jsonify({'error': 'Invalid phone number format'}), 400
                update['phone'] = phone

            if 'beneficiaryCategory' in data:
                category = (data.get('beneficiaryCategory') or '').strip()
                if category and not validate_beneficiary_category(category):
                    return jsonify({'error': 'Invalid beneficiary category'}), 400
                update['beneficiaryCategory'] = category

            if 'isActive' in data:
                update['isActive'] = bool(data.get('isActive'))

            if not update:
                return jsonify({'error': 'No valid fields to update'}), 400

            update['updatedAt'] = datetime.now(timezone.utc)

            res = collections['users'].update_one({ '_id': _id }, { '$set': update })
            if res.matched_count == 0:
                return jsonify({'error': 'User not found'}), 404

            return jsonify({ 'message': 'User updated' }), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update user: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(admin_bp)
