"""
Supply requests routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from bson import ObjectId
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
        for req in requests:
            req['_id'] = str(req['_id'])
            req['userId'] = str(req['userId'])
            req['reviewedBy'] = str(req['reviewedBy']) if req.get('reviewedBy') else None
            req['createdAt'] = req['createdAt'].isoformat() if req.get('createdAt') else None
            req['updatedAt'] = req['updatedAt'].isoformat() if req.get('updatedAt') else None

            # Get user details
            user = db['users'].find_one({'_id': ObjectId(req['userId'])})
            if user:
                req['user'] = {
                    'name': user.get('name', 'Unknown User'),
                    'email': user.get('email', 'unknown@example.com'),
                    'beneficiaryCategory': user.get('beneficiaryCategory', 'unknown')
                }
            else:
                req['user'] = {
                    'name': 'Unknown User',
                    'email': 'unknown@example.com',
                    'beneficiaryCategory': 'unknown'
                }

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

        # Get user's requests
        requests = list(db['supply_requests'].find({'userId': ObjectId(user_id)})
                       .sort('createdAt', -1))

        # Convert ObjectId to string and format dates
        for req in requests:
            req['_id'] = str(req['_id'])
            req['createdAt'] = req['createdAt'].isoformat() if req.get('createdAt') else None
            req['updatedAt'] = req['updatedAt'].isoformat() if req.get('updatedAt') else None
            req['expectedDeliveryDate'] = req['expectedDeliveryDate'].isoformat() if req.get('expectedDeliveryDate') else None
            req['scheduledAt'] = req['scheduledAt'].isoformat() if req.get('scheduledAt') else None
            if req.get('scheduledBy'):
                req['scheduledBy'] = str(req['scheduledBy'])

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
            req['createdAt'] = req['createdAt'].isoformat() if req.get('createdAt') else None
            req['updatedAt'] = req['updatedAt'].isoformat() if req.get('updatedAt') else None
            req['reviewedBy'] = str(req['reviewedBy']) if req.get('reviewedBy') else None

            # Get user details
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

        return jsonify({'requests': requests}), 200

    except Exception as e:
        print(f"Error getting approved supply requests: {e}")
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

        if not expected_delivery_date:
            return jsonify({'error': 'Expected delivery date is required'}), 400

        # Validate that the request exists and is approved
        request_doc = db['supply_requests'].find_one({'_id': ObjectId(request_id)})
        if not request_doc:
            return jsonify({'error': 'Supply request not found'}), 404

        if request_doc['status'] != 'approved':
            return jsonify({'error': 'Only approved requests can be scheduled for delivery'}), 400

        # Update the request with delivery scheduling info
        update_data = {
            'expectedDeliveryDate': datetime.fromisoformat(expected_delivery_date.replace('Z', '+00:00')),
            'scheduledBy': asha_worker_id,
            'scheduledAt': datetime.now(timezone.utc),
            'updatedAt': datetime.now(timezone.utc)
        }

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