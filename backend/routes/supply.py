"""
Supply requests routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from middleware.auth import require_auth, require_admin
from config.database import get_collections
from services.file_service import FileService
import traceback

supply_bp = Blueprint('supply', __name__)
file_service = FileService()

def init_supply_routes(app, collections):
    """Initialize supply request routes"""
    # Make collections available to routes
    @supply_bp.before_request
    def before_request():
        request.db = collections

    # Register blueprint
    app.register_blueprint(supply_bp, url_prefix='/api')

@supply_bp.route('/supply-requests', methods=['POST'])
@require_auth
def submit_supply_request():
    """Submit a supply request with proof document"""
    try:
        user_id = request.user_id

        # Get form data
        supply_name = request.form.get('supplyName')
        description = request.form.get('description')
        category = request.form.get('category')

        # Validate required fields
        if not all([supply_name, description, category]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Handle file upload
        proof_file = request.files.get('proof')
        if not proof_file:
            return jsonify({'error': 'Proof document is required'}), 400

        # Save the uploaded file
        file_url = file_service.save_uploaded_file(proof_file, prefix="supply_proof")
        if not file_url:
            return jsonify({'error': 'Failed to save proof document'}), 500

        # Get database collections
        db = request.db

        # Create supply request document
        supply_request = {
            'userId': user_id,
            'supplyName': supply_name,
            'description': description,
            'category': category,
            'proofFile': file_url,
            'status': 'pending',
            'createdAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        }

        # Insert into database
        result = db['supply_requests'].insert_one(supply_request)

        return jsonify({
            'message': 'Supply request submitted successfully',
            'requestId': str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Error submitting supply request: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@supply_bp.route('/supply-requests', methods=['GET'])
@require_admin
def get_supply_requests():
    """Get all supply requests for admin review"""
    try:
        db = request.db
        print("db keys:", list(db.keys()))

        # Get query parameters
        status = request.args.get('status')
        category = request.args.get('category')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))

        # Build query
        query = {}
        if status:
            query['status'] = status
        if category:
            query['category'] = category

        # Get total count
        total = db['supply_requests'].count_documents(query)

        # Get requests with pagination
        requests = list(db['supply_requests'].find(query)
                       .sort('createdAt', -1)
                       .skip((page - 1) * limit)
                       .limit(limit))

        # Convert ObjectId to string and format dates
        def format_datetime(value):
            """Convert datetime or string to ISO format string."""
            if not value:
                return None
            if hasattr(value, 'isoformat'):
                return value.isoformat()
            # Fallback for stored string values
            return str(value)

        def to_object_id(value):
            """Safely convert a value to ObjectId, returning None if invalid."""
            if not value:
                return None
            if isinstance(value, ObjectId):
                return value
            try:
                return ObjectId(value)
            except (InvalidId, TypeError):
                return None

        def serialize_object_id(value):
            """Return string representation for ObjectId values."""
            if not value:
                return None
            if isinstance(value, ObjectId):
                return str(value)
            return value

        for req in requests:
            # Convert all ObjectId fields to strings
            req['_id'] = serialize_object_id(req.get('_id'))
            req['userId'] = serialize_object_id(req.get('userId'))
            req['reviewedBy'] = serialize_object_id(req.get('reviewedBy'))
            req['scheduledBy'] = serialize_object_id(req.get('scheduledBy'))
            req['deliveryCompletedBy'] = serialize_object_id(req.get('deliveryCompletedBy'))
            req['anganwadiLocationId'] = serialize_object_id(req.get('anganwadiLocationId'))

            # Format datetime fields
            req['createdAt'] = format_datetime(req.get('createdAt'))
            req['updatedAt'] = format_datetime(req.get('updatedAt'))
            req['expectedDeliveryDate'] = format_datetime(req.get('expectedDeliveryDate'))
            req['scheduledAt'] = format_datetime(req.get('scheduledAt'))
            req['deliveryCompletedAt'] = format_datetime(req.get('deliveryCompletedAt'))

            # Get user details
            user_id = req.get('userId')
            user_object_id = to_object_id(user_id)
            user_details = {
                'name': 'Unknown User',
                'email': 'unknown@example.com',
                'beneficiaryCategory': 'unknown'
            }

            if user_object_id:
                try:
                    user = db['users'].find_one({'_id': user_object_id})
                    if user:
                        user_details = {
                            'name': user.get('name', 'Unknown User'),
                            'email': user.get('email', 'unknown@example.com'),
                            'beneficiaryCategory': user.get('beneficiaryCategory', 'unknown')
                        }
                except Exception as user_error:
                    print(f"Error fetching user details for userId {req['userId']}: {user_error}")

            req['user'] = user_details

        return jsonify({
            'requests': requests,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        print(f"Error getting supply requests: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@supply_bp.route('/supply-requests/<request_id>', methods=['PUT'])
@require_admin
def update_supply_request(request_id):
    """Approve or reject a supply request"""
    try:
        db = request.db
        admin_id = request.user_id

        # Get request data
        data = request.get_json()
        status = data.get('status')
        review_notes = data.get('reviewNotes', '')

        if status not in ['approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400

        # Update the request
        update_data = {
            'status': status,
            'reviewedBy': admin_id,
            'reviewNotes': review_notes,
            'updatedAt': datetime.now(timezone.utc)
        }

        result = db['supply_requests'].update_one(
            {'_id': ObjectId(request_id)},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Supply request not found'}), 404

        return jsonify({'message': f'Supply request {status} successfully'}), 200

    except Exception as e:
        print(f"Error updating supply request: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@supply_bp.route('/supply-requests/user', methods=['GET'])
@require_auth
def get_user_supply_requests():
    """Get supply requests for the authenticated user"""
    try:
        user_id = request.user_id
        db = request.db

        # Validate user_id
        if not user_id:
            return jsonify({'error': 'User ID not found in token'}), 401

        try:
            user_object_id = ObjectId(user_id)
        except Exception as oid_error:
            print(f"Invalid user_id format: {user_id}, error: {oid_error}")
            return jsonify({'error': 'Invalid user ID format'}), 400

        # Get user's requests
        requests = list(db['supply_requests'].find({'userId': user_object_id})
                       .sort('createdAt', -1))

        # Convert ObjectId to string and format dates
        for req in requests:
            req['_id'] = str(req['_id'])
            req['userId'] = str(req['userId'])
            req['reviewedBy'] = str(req['reviewedBy']) if req.get('reviewedBy') else None
            req['createdAt'] = req['createdAt'].isoformat() if req.get('createdAt') and hasattr(req['createdAt'], 'isoformat') else None
            req['updatedAt'] = req['updatedAt'].isoformat() if req.get('updatedAt') and hasattr(req['updatedAt'], 'isoformat') else None
            req['expectedDeliveryDate'] = req['expectedDeliveryDate'].isoformat() if req.get('expectedDeliveryDate') and hasattr(req['expectedDeliveryDate'], 'isoformat') else None
            req['scheduledAt'] = req['scheduledAt'].isoformat() if req.get('scheduledAt') and hasattr(req['scheduledAt'], 'isoformat') else None
            req['deliveryLocation'] = req.get('deliveryLocation')
            if req.get('scheduledBy'):
                req['scheduledBy'] = str(req['scheduledBy'])
            
            # Get Anganwadi location details if ward delivery
            if req.get('anganwadiLocationId'):
                try:
                    location = db['locations'].find_one({'_id': ObjectId(req['anganwadiLocationId'])})
                    if location:
                        req['anganwadiLocation'] = {
                            'name': location.get('name'),
                            'address': location.get('address'),
                            'ward': location.get('ward')
                        }
                    req['anganwadiLocationId'] = str(req['anganwadiLocationId'])
                except Exception as loc_error:
                    print(f"Error fetching location details: {loc_error}")
                    req['anganwadiLocationId'] = str(req['anganwadiLocationId']) if req.get('anganwadiLocationId') else None

        return jsonify({'requests': requests}), 200

    except Exception as e:
        print(f"Error getting user supply requests: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@supply_bp.route('/supply-requests/approved', methods=['GET'])
@require_auth
def get_approved_supply_requests():
    """Get approved supply requests for ASHA workers to schedule delivery"""
    try:
        db = request.db

        # Get approved requests that haven't been scheduled yet or need rescheduling
        requests = list(db['supply_requests'].find({
            'status': 'approved',
            '$or': [
                {'expectedDeliveryDate': {'$exists': False}},
                {'expectedDeliveryDate': None}
            ]
        }).sort('createdAt', -1))

        # Convert ObjectId to string and format dates, add user details
        for req in requests:
            req['_id'] = str(req['_id'])
            req['userId'] = str(req['userId'])
            req['createdAt'] = req['createdAt'].isoformat() if req.get('createdAt') and hasattr(req['createdAt'], 'isoformat') else None
            req['updatedAt'] = req['updatedAt'].isoformat() if req.get('updatedAt') and hasattr(req['updatedAt'], 'isoformat') else None
            req['reviewedBy'] = str(req['reviewedBy']) if req.get('reviewedBy') else None

            # Get user details
            try:
                user = db['users'].find_one({'_id': ObjectId(req['userId'])})
                if user:
                    req['user'] = {
                        'name': user.get('name', 'Unknown User'),
                        'email': user.get('email', 'unknown@example.com'),
                        'beneficiaryCategory': user.get('beneficiaryCategory', 'unknown'),
                        'phone': user.get('phone', ''),
                        'address': user.get('address', '')
                    }
                else:
                    req['user'] = {
                        'name': 'Unknown User',
                        'email': 'unknown@example.com',
                        'beneficiaryCategory': 'unknown',
                        'phone': '',
                        'address': ''
                    }
            except Exception as user_error:
                print(f"Error fetching user details for userId {req['userId']}: {user_error}")
                req['user'] = {
                    'name': 'Unknown User',
                    'email': 'unknown@example.com',
                    'beneficiaryCategory': 'unknown',
                    'phone': '',
                    'address': ''
                }

        return jsonify({'requests': requests}), 200

    except Exception as e:
        print(f"Error getting approved supply requests: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@supply_bp.route('/supply-requests/scheduled', methods=['GET'])
@require_auth
def get_scheduled_supply_requests():
    """Get scheduled supply requests history for ASHA workers"""
    try:
        db = request.db

        # Get scheduled requests (approved with expectedDeliveryDate set)
        requests = list(db['supply_requests'].find({
            'status': 'approved',
            'expectedDeliveryDate': {'$exists': True, '$ne': None}
        }).sort('expectedDeliveryDate', 1))  # Sort by delivery date ascending

        # Convert ObjectId to string and format dates, add user details
        for req in requests:
            req['_id'] = str(req['_id'])
            req['userId'] = str(req['userId'])
            req['createdAt'] = req['createdAt'].isoformat() if req.get('createdAt') and hasattr(req['createdAt'], 'isoformat') else None
            req['updatedAt'] = req['updatedAt'].isoformat() if req.get('updatedAt') and hasattr(req['updatedAt'], 'isoformat') else None
            req['reviewedBy'] = str(req['reviewedBy']) if req.get('reviewedBy') else None
            req['expectedDeliveryDate'] = req['expectedDeliveryDate'].isoformat() if req.get('expectedDeliveryDate') and hasattr(req['expectedDeliveryDate'], 'isoformat') else None
            req['scheduledAt'] = req['scheduledAt'].isoformat() if req.get('scheduledAt') and hasattr(req['scheduledAt'], 'isoformat') else None
            if req.get('scheduledBy'):
                req['scheduledBy'] = str(req['scheduledBy'])

            # Get user details
            try:
                user = db['users'].find_one({'_id': ObjectId(req['userId'])})
                if user:
                    req['user'] = {
                        'name': user.get('name', 'Unknown User'),
                        'email': user.get('email', 'unknown@example.com'),
                        'beneficiaryCategory': user.get('beneficiaryCategory', 'unknown'),
                        'phone': user.get('phone', ''),
                        'address': user.get('address', '')
                    }
                else:
                    req['user'] = {
                        'name': 'Unknown User',
                        'email': 'unknown@example.com',
                        'beneficiaryCategory': 'unknown',
                        'phone': '',
                        'address': ''
                    }
            except Exception as user_error:
                print(f"Error fetching user details for userId {req['userId']}: {user_error}")
                req['user'] = {
                    'name': 'Unknown User',
                    'email': 'unknown@example.com',
                    'beneficiaryCategory': 'unknown',
                    'phone': '',
                    'address': ''
                }

        return jsonify({'requests': requests}), 200

    except Exception as e:
        print(f"Error getting scheduled supply requests: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@supply_bp.route('/supply-requests/<request_id>/status', methods=['PUT'])
@require_auth
def update_delivery_status(request_id):
    """Update delivery status (mark as delivered or cancelled)"""
    try:
        db = request.db
        asha_worker_id = request.user_id

        # Get request data
        data = request.get_json()
        delivery_status = data.get('deliveryStatus')

        if delivery_status not in ['delivered', 'cancelled']:
            return jsonify({'error': 'Invalid delivery status'}), 400

        # Validate that the request exists
        request_doc = db['supply_requests'].find_one({'_id': ObjectId(request_id)})
        if not request_doc:
            return jsonify({'error': 'Supply request not found'}), 404

        # Update the request with delivery status
        update_data = {
            'status': delivery_status,
            'deliveryCompletedBy': asha_worker_id if delivery_status == 'delivered' else None,
            'deliveryCompletedAt': datetime.now(timezone.utc) if delivery_status == 'delivered' else None,
            'updatedAt': datetime.now(timezone.utc)
        }

        result = db['supply_requests'].update_one(
            {'_id': ObjectId(request_id)},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Supply request not found'}), 404

        message = 'Marked as delivered' if delivery_status == 'delivered' else 'Delivery cancelled'
        return jsonify({'message': message}), 200

    except Exception as e:
        print(f"Error updating delivery status: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@supply_bp.route('/supply-requests/<request_id>/schedule', methods=['PUT'])
@require_auth
def schedule_supply_delivery(request_id):
    """Schedule delivery for an approved supply request"""
    try:
        db = request.db
        asha_worker_id = request.user_id

        # Get request data
        data = request.get_json()
        expected_delivery_date = data.get('expectedDeliveryDate')
        delivery_location = data.get('deliveryLocation', 'home')  # 'home' or 'ward'
        anganwadi_location_id = data.get('anganwadiLocationId')  # ObjectId if ward delivery

        if not expected_delivery_date:
            return jsonify({'error': 'Expected delivery date is required'}), 400

        # Validate delivery location
        if delivery_location not in ['home', 'ward']:
            return jsonify({'error': 'Invalid delivery location'}), 400

        # If ward delivery, validate anganwadi location exists
        if delivery_location == 'ward':
            if not anganwadi_location_id:
                return jsonify({'error': 'Anganwadi location is required for ward delivery'}), 400
            
            try:
                location = db['locations'].find_one({'_id': ObjectId(anganwadi_location_id), 'active': True})
                if not location:
                    return jsonify({'error': 'Invalid or inactive Anganwadi location'}), 400
            except Exception as loc_error:
                print(f"Error validating location: {loc_error}")
                return jsonify({'error': 'Invalid Anganwadi location ID'}), 400

        # Validate that the request exists and is approved
        request_doc = db['supply_requests'].find_one({'_id': ObjectId(request_id)})
        if not request_doc:
            return jsonify({'error': 'Supply request not found'}), 404

        if request_doc['status'] != 'approved':
            return jsonify({'error': 'Only approved requests can be scheduled for delivery'}), 400

        # Update the request with delivery scheduling info
        update_data = {
            'expectedDeliveryDate': datetime.fromisoformat(expected_delivery_date.replace('Z', '+00:00')),
            'deliveryLocation': delivery_location,
            'scheduledBy': asha_worker_id,
            'scheduledAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc),
            'status': 'scheduled'  # Change status to scheduled
        }

        # Add anganwadi location details if ward delivery
        if delivery_location == 'ward' and anganwadi_location_id:
            update_data['anganwadiLocationId'] = ObjectId(anganwadi_location_id)

        result = db['supply_requests'].update_one(
            {'_id': ObjectId(request_id)},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Supply request not found'}), 404

        return jsonify({'message': 'Delivery scheduled successfully'}), 200

    except Exception as e:
        print(f"Error scheduling supply delivery: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500