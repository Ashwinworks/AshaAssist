"""
Maternity-specific routes for pregnancy tracking and management
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.maternity_service import MaternityService
from bson import ObjectId
from datetime import datetime

# Create blueprint
maternity_bp = Blueprint('maternity', __name__)

def init_maternity_routes(app, collections):
    """Initialize maternity routes with dependencies"""
    maternity_service = MaternityService(collections['users'], collections['visits'])
    
    @maternity_bp.route('/api/maternity/profile', methods=['PUT'])
    @jwt_required()
    def set_maternity_profile():
        """Set or update maternity profile with LMP/EDD"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            result, status_code = maternity_service.set_maternity_profile(user_id, data)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to update maternity profile: {str(e)}'}), 500

    @maternity_bp.route('/api/maternity/visits', methods=['GET'])
    @jwt_required()
    def get_maternity_visits():
        """Get all maternity visits for the authenticated user"""
        try:
            user_id = get_jwt_identity()
            result, status_code = maternity_service.get_maternity_visits(user_id)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch visits: {str(e)}'}), 500

    @maternity_bp.route('/api/maternity/visits', methods=['POST'])
    @jwt_required()
    def add_maternity_visit():
        """Add a new maternity visit"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            result, status_code = maternity_service.add_maternity_visit(user_id, data)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to add visit: {str(e)}'}), 500

    @maternity_bp.route('/api/maternity/visits/<visit_id>', methods=['DELETE'])
    @jwt_required()
    def delete_maternity_visit(visit_id):
        """Delete a maternity visit"""
        try:
            user_id = get_jwt_identity()
            result, status_code = maternity_service.delete_maternity_visit(user_id, visit_id)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to delete visit: {str(e)}'}), 500

    @maternity_bp.route('/api/maternity/schedule', methods=['GET'])
    @jwt_required()
    def get_maternity_schedule():
        """Get maternity visit schedule for the authenticated user"""
        try:
            user_id = get_jwt_identity()
            result, status_code = maternity_service.get_maternity_schedule(user_id)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch schedule: {str(e)}'}), 500

    # Get all maternity records (for ASHA workers)
    @maternity_bp.route('/api/maternity/records/all', methods=['GET'])
    @jwt_required()
    def get_all_maternity_records():
        """Get all maternity records for ASHA workers"""
        try:
            # Get user info to check if they're an ASHA worker
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            if not user or user.get('userType') != 'asha_worker':
                return jsonify({'error': 'Access denied. ASHA workers only.'}), 403

            # Get query parameters
            user_name = request.args.get('userName', '').strip()
            date_from = request.args.get('dateFrom', '').strip()
            date_to = request.args.get('dateTo', '').strip()

            # Build query for visits
            query = {}
            if date_from or date_to:
                date_query = {}
                if date_from:
                    date_query['$gte'] = date_from
                if date_to:
                    date_query['$lte'] = date_to
                query['visitDate'] = date_query

            # Get visits with user information
            pipeline = [
                {'$match': query},
                {'$lookup': {
                    'from': 'users',
                    'localField': 'userId',
                    'foreignField': '_id',
                    'as': 'user'
                }},
                {'$unwind': '$user'},
                {'$sort': {'visitDate': -1, 'createdAt': -1}}
            ]

            # Filter by user name if provided
            if user_name:
                pipeline.insert(-1, {'$match': {'user.name': {'$regex': user_name, '$options': 'i'}}})

            cursor = collections['visits'].aggregate(pipeline)
            items = []
            
            for doc in cursor:
                items.append({
                    'id': str(doc['_id']),
                    'visitDate': doc.get('visitDate'),
                    'week': doc.get('week'),
                    'center': doc.get('center'),
                    'notes': doc.get('notes'),
                    'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                    'user': {
                        'id': str(doc['user']['_id']),
                        'name': doc['user'].get('name'),
                        'email': doc['user'].get('email'),
                        'phone': doc['user'].get('phone')
                    }
                })

            return jsonify({'records': items}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to get records: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(maternity_bp)
    
    return maternity_service
