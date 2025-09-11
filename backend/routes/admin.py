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

    # Register blueprint with app
    app.register_blueprint(admin_bp)
