"""
Milestone routes for maternity users
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.milestone_service import MilestoneService
from bson import ObjectId

# Create blueprint
milestones_bp = Blueprint('milestones', __name__)

def init_milestone_routes(app, collections):
    """Initialize milestone routes with dependencies"""
    milestone_service = MilestoneService(
        collections['users'],
        collections['developmental_milestones'],
        collections['milestone_records']
    )
    
    @milestones_bp.route('/api/milestones', methods=['GET'])
    @jwt_required()
    def get_milestones():
        """Get all developmental milestones"""
        try:
            result, status_code = milestone_service.get_all_milestones()
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch milestones: {str(e)}'}), 500

    @milestones_bp.route('/api/milestones/my-progress', methods=['GET'])
    @jwt_required()
    def get_my_milestones():
        """Get user's milestone progress"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only maternity users can access
            if not user or user.get('beneficiaryCategory') != 'maternity':
                return jsonify({'error': 'Access denied. Maternity users only.'}), 403
            
            result, status_code = milestone_service.get_user_milestones(user_id)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch milestone progress: {str(e)}'}), 500

    @milestones_bp.route('/api/milestones/record', methods=['POST'])
    @jwt_required()
    def record_milestone():
        """Record a milestone achievement"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only maternity users can record
            if not user or user.get('beneficiaryCategory') != 'maternity':
                return jsonify({'error': 'Access denied. Maternity users only.'}), 403
            
            data = request.get_json()
            milestone_id = data.get('milestoneId')
            achieved_date = data.get('achievedDate')
            notes = data.get('notes')
            photo_url = data.get('photoUrl')
            
            print(f"DEBUG: Recording milestone - ID: {milestone_id}, Date: {achieved_date}, Notes: {notes}, Photo: {photo_url}")
            
            if not milestone_id or not achieved_date:
                return jsonify({'error': 'milestoneId and achievedDate are required'}), 400
            
            result, status_code = milestone_service.record_milestone(
                user_id, milestone_id, achieved_date, notes, photo_url
            )
            
            print(f"DEBUG: Result - {result}, Status: {status_code}")
            
            return jsonify(result), status_code
        except Exception as e:
            print(f"ERROR in record_milestone route: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f'Failed to record milestone: {str(e)}'}), 500

    @milestones_bp.route('/api/milestones/record/<record_id>', methods=['PUT'])
    @jwt_required()
    def update_milestone_record(record_id):
        """Update a milestone record"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only maternity users can update
            if not user or user.get('beneficiaryCategory') != 'maternity':
                return jsonify({'error': 'Access denied. Maternity users only.'}), 403
            
            data = request.get_json()
            achieved_date = data.get('achievedDate')
            notes = data.get('notes')
            photo_url = data.get('photoUrl')
            
            result, status_code = milestone_service.update_milestone_record(
                user_id, record_id, achieved_date, notes, photo_url
            )
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to update milestone record: {str(e)}'}), 500

    @milestones_bp.route('/api/milestones/record/<record_id>', methods=['DELETE'])
    @jwt_required()
    def delete_milestone_record(record_id):
        """Delete a milestone record"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only maternity users can delete
            if not user or user.get('beneficiaryCategory') != 'maternity':
                return jsonify({'error': 'Access denied. Maternity users only.'}), 403
            
            result, status_code = milestone_service.delete_milestone_record(user_id, record_id)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to delete milestone record: {str(e)}'}), 500

    @milestones_bp.route('/api/milestones/seed', methods=['POST'])
    @jwt_required()
    def seed_milestones():
        """Seed initial milestone data (Admin only)"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only admins can seed
            if not user or user.get('userType') != 'admin':
                return jsonify({'error': 'Access denied. Admins only.'}), 403
            
            result, status_code = milestone_service.seed_milestones()
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to seed milestones: {str(e)}'}), 500

    # ASHA Worker Routes
    @milestones_bp.route('/api/milestones/asha/maternal-users', methods=['GET'])
    @jwt_required()
    def get_maternal_users_milestones():
        """Get all maternal users with milestone progress (ASHA worker)"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only ASHA workers can access
            if not user or user.get('userType') not in ['asha', 'asha_worker']:
                return jsonify({'error': 'Access denied. ASHA workers only.'}), 403
            
            result, status_code = milestone_service.get_maternal_users_milestones(user_id)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch maternal users: {str(e)}'}), 500

    @milestones_bp.route('/api/milestones/asha/user/<user_id>', methods=['GET'])
    @jwt_required()
    def get_user_milestone_details(user_id):
        """Get detailed milestone information for a specific user (ASHA worker)"""
        try:
            asha_id = get_jwt_identity()
            asha_user = collections['users'].find_one({'_id': ObjectId(asha_id)})
            
            # Only ASHA workers can access
            if not asha_user or asha_user.get('userType') not in ['asha', 'asha_worker']:
                return jsonify({'error': 'Access denied. ASHA workers only.'}), 403
            
            result, status_code = milestone_service.get_user_milestone_details(user_id)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch user milestone details: {str(e)}'}), 500

    @milestones_bp.route('/api/milestones/asha/verify/<record_id>', methods=['PUT'])
    @jwt_required()
    def verify_milestone(record_id):
        """Verify a milestone record (ASHA worker)"""
        try:
            asha_id = get_jwt_identity()
            asha_user = collections['users'].find_one({'_id': ObjectId(asha_id)})
            
            # Only ASHA workers can verify
            if not asha_user or asha_user.get('userType') not in ['asha', 'asha_worker']:
                return jsonify({'error': 'Access denied. ASHA workers only.'}), 403
            
            data = request.get_json()
            verification_status = data.get('verificationStatus')
            notes = data.get('notes')
            
            if not verification_status:
                return jsonify({'error': 'verificationStatus is required'}), 400
            
            result, status_code = milestone_service.verify_milestone(
                record_id, asha_id, verification_status, notes
            )
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to verify milestone: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(milestones_bp)
    
    return milestone_service
