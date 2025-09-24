"""
Visit Request routes for users and ASHA workers
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services.visit_request_service import VisitRequestService

visit_request_bp = Blueprint('visit_request', __name__)


def init_visit_request_routes(app, collections):
    """Initialize visit request routes with dependencies"""
    visit_request_service = VisitRequestService(collections['users'], collections['visit_requests'])

    @visit_request_bp.route('/api/visit-requests', methods=['POST'])
    @jwt_required()
    def create_visit_request():
        """Create a new visit request (for maternity/palliative users)"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt()
            user_type = claims.get('userType')

            # Only maternity and palliative users can create visit requests
            # For 'user' type, check beneficiaryCategory; otherwise check userType directly
            allowed_types = ['maternity', 'palliative']
            if user_type == 'user':
                # For regular users, check beneficiaryCategory
                beneficiary_category = claims.get('beneficiaryCategory')
                if beneficiary_category not in allowed_types:
                    return jsonify({'error': 'Unauthorized'}), 403
            elif user_type not in allowed_types:
                return jsonify({'error': 'Unauthorized'}), 403

            data = request.get_json() or {}
            result, status_code = visit_request_service.create_visit_request(user_id, data)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to create visit request: {str(e)}'}), 500

    @visit_request_bp.route('/api/visit-requests', methods=['GET'])
    @jwt_required()
    def get_visit_requests():
        """Get visit requests based on user type"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt()
            user_type = claims.get('userType')

            # Check if user is a regular user with beneficiary category
            allowed_types = ['maternity', 'palliative']
            if user_type == 'user':
                # For regular users, check beneficiaryCategory
                beneficiary_category = claims.get('beneficiaryCategory')
                if beneficiary_category in allowed_types:
                    # Regular users get their own requests
                    result, status_code = visit_request_service.get_user_visit_requests(user_id)
                else:
                    return jsonify({'error': 'Unauthorized'}), 403
            elif user_type in allowed_types:
                # Direct user types (legacy support)
                result, status_code = visit_request_service.get_user_visit_requests(user_id)
            elif user_type in ['asha_worker', 'admin']:
                # ASHA workers and admins get all requests with filters
                filters = {
                    'status': request.args.get('status'),
                    'requestType': request.args.get('requestType'),
                    'priority': request.args.get('priority')
                }
                # Remove None values
                filters = {k: v for k, v in filters.items() if v is not None}
                result, status_code = visit_request_service.get_visit_requests_for_asha(user_id, filters)
            else:
                return jsonify({'error': 'Unauthorized'}), 403

            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch visit requests: {str(e)}'}), 500

    @visit_request_bp.route('/api/visit-requests/<request_id>/status', methods=['PUT'])
    @jwt_required()
    def update_visit_request_status(request_id):
        """Update visit request status (for ASHA workers/admins)"""
        try:
            claims = get_jwt()
            user_type = claims.get('userType')
            user_id = get_jwt_identity()

            # Only ASHA workers and admins can update status
            if user_type not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Unauthorized'}), 403

            data = request.get_json() or {}
            new_status = data.get('status')
            if not new_status:
                return jsonify({'error': 'Status is required'}), 400

            # For scheduling, get additional parameters
            scheduled_date = data.get('scheduledDate')
            scheduled_time = data.get('scheduledTime')

            result, status_code = visit_request_service.update_visit_request_status(
                request_id, new_status, user_id, scheduled_date, scheduled_time
            )
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to update visit request: {str(e)}'}), 500

    @visit_request_bp.route('/api/visit-requests/stats', methods=['GET'])
    @jwt_required()
    def get_visit_request_stats():
        """Get visit request statistics (for ASHA workers/admins)"""
        try:
            claims = get_jwt()
            user_type = claims.get('userType')

            # Only ASHA workers and admins can view stats
            if user_type not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Unauthorized'}), 403

            result, status_code = visit_request_service.get_visit_request_stats()
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to get stats: {str(e)}'}), 500

    app.register_blueprint(visit_request_bp)