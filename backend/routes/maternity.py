"""
Maternity-specific routes for pregnancy tracking and management
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.maternity_service import MaternityService
from bson import ObjectId
from datetime import datetime, timezone

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
    
    @maternity_bp.route('/api/maternity/record-birth', methods=['POST'])
    @jwt_required()
    def record_birth():
        """Record birth details and update mother status to delivered"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            
            # Get user to verify they're pregnant
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.get('beneficiaryCategory') != 'maternity':
                return jsonify({'error': 'Only maternity users can record births'}), 403
            
            maternal_health = user.get('maternalHealth', {})
            if maternal_health.get('pregnancyStatus') != 'pregnant':
                return jsonify({'error': 'User is not marked as pregnant'}), 400
            
            # Validate required fields
            required_fields = ['deliveryDate', 'deliveryType', 'location', 'childName', 'childGender', 'childWeight', 'childHeight']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({'error': f'{field} is required'}), 400
            
            # Parse and validate delivery date
            try:
                # Remove 'Z' suffix if present and parse
                date_str = data['deliveryDate'].replace('Z', '+00:00')
                delivery_date = datetime.fromisoformat(date_str)
                # Make timezone-aware if needed
                if delivery_date.tzinfo is None:
                    delivery_date = delivery_date.replace(tzinfo=timezone.utc)
                
                if delivery_date > datetime.now(timezone.utc):
                    return jsonify({'error': 'Delivery date cannot be in the future'}), 400
            except Exception as e:
                return jsonify({'error': f'Invalid delivery date format: {str(e)}'}), 400
            
            # Validate delivery type
            if data['deliveryType'] not in ['normal', 'c-section', 'home']:
                return jsonify({'error': 'Invalid delivery type'}), 400
            
            # Validate child gender
            if data['childGender'] not in ['male', 'female']:
                return jsonify({'error': 'Invalid child gender'}), 400
            
            # Validate weight and height
            try:
                weight = int(data['childWeight'])
                height = int(data['childHeight'])
                if not (500 <= weight <= 6000):
                    return jsonify({'error': 'Child weight must be between 500g and 6000g'}), 400
                if not (30 <= height <= 70):
                    return jsonify({'error': 'Child height must be between 30cm and 70cm'}), 400
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid weight or height value'}), 400
            
            # Update mother's status
            update_data = {
                'maternalHealth.pregnancyStatus': 'delivered',
                'maternalHealth.deliveryDate': delivery_date,
                'maternalHealth.deliveryDetails': {
                    'type': data['deliveryType'],
                    'location': data['location'],
                    'complications': data.get('complications', 'None')
                },
                'updatedAt': datetime.now(timezone.utc)
            }
            
            # Add child data
            child_data = {
                'name': data['childName'],
                'gender': data['childGender'],
                'weight': weight,
                'height': height,
                'dateOfBirth': delivery_date
            }
            
            # Update user with $push for children array
            result = collections['users'].update_one(
                {'_id': ObjectId(user_id)},
                {
                    '$set': update_data,
                    '$push': {'maternalHealth.children': child_data}
                }
            )
            
            if result.matched_count == 0:
                return jsonify({'error': 'Failed to update user'}), 500
            
            # Get updated user to return
            updated_user = collections['users'].find_one({'_id': ObjectId(user_id)})
            if updated_user:
                updated_user.pop('password', None)
                updated_user['id'] = str(updated_user['_id'])
                updated_user.pop('_id', None)
            
            return jsonify({
                'success': True,
                'message': 'Birth recorded successfully! Vaccination features are now unlocked.',
                'user': updated_user,
                'vaccinationsUnlocked': True
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to record birth: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(maternity_bp)
    
    return maternity_service
