"""
Weekly ration routes for Anganvaadi and maternity users
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.weekly_ration_service import WeeklyRationService
from bson import ObjectId

# Create blueprint
weekly_ration_bp = Blueprint('weekly_ration', __name__)

def init_weekly_ration_routes(app, collections):
    """Initialize weekly ration routes with dependencies"""
    ration_service = WeeklyRationService(
        collections['users'], 
        collections['weekly_rations']
    )
    
    @weekly_ration_bp.route('/api/weekly-rations', methods=['GET'])
    @jwt_required()
    def get_weekly_rations():
        """Get all weekly rations for a specific week (Anganvaadi view)"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only anganvaadi workers can view all rations
            if not user or user.get('userType') != 'anganvaadi':
                return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
            
            week_start_date = request.args.get('weekStartDate')
            result, status_code = ration_service.get_rations_for_week(week_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch weekly rations: {str(e)}'}), 500

    @weekly_ration_bp.route('/api/weekly-rations/my-status', methods=['GET'])
    @jwt_required()
    def get_my_ration_status():
        """Get current user's ration status for the week (Maternity user view)"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only maternity users can check their own status
            if not user or user.get('beneficiaryCategory') != 'maternity':
                return jsonify({'error': 'Access denied. Maternity users only.'}), 403
            
            week_start_date = request.args.get('weekStartDate')
            result, status_code = ration_service.get_user_ration_status(user_id, week_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch ration status: {str(e)}'}), 500

    @weekly_ration_bp.route('/api/weekly-rations/mark-collected', methods=['PUT'])
    @jwt_required()
    def mark_collected():
        """Mark ration as collected (can be called by maternity user or anganvaadi)"""
        try:
            current_user_id = get_jwt_identity()
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            data = request.get_json() or {}
            week_start_date = data.get('weekStartDate')
            
            # If anganvaadi worker, they can mark any user's ration
            if current_user.get('userType') == 'anganvaadi':
                user_id = data.get('userId')
                if not user_id:
                    return jsonify({'error': 'userId is required'}), 400
            # If maternity user, they can only mark their own
            elif current_user.get('beneficiaryCategory') == 'maternity':
                user_id = current_user_id
            else:
                return jsonify({'error': 'Access denied'}), 403
            
            result, status_code = ration_service.mark_ration_collected(user_id, week_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to mark ration as collected: {str(e)}'}), 500

    @weekly_ration_bp.route('/api/weekly-rations/mark-pending', methods=['PUT'])
    @jwt_required()
    def mark_pending():
        """Mark ration as pending (undo collection) - Anganvaadi only"""
        try:
            current_user_id = get_jwt_identity()
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            
            # Only anganvaadi workers can undo collection
            if not current_user or current_user.get('userType') != 'anganvaadi':
                return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
            
            data = request.get_json() or {}
            user_id = data.get('userId')
            week_start_date = data.get('weekStartDate')
            
            if not user_id:
                return jsonify({'error': 'userId is required'}), 400
            
            result, status_code = ration_service.mark_ration_pending(user_id, week_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to mark ration as pending: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(weekly_ration_bp)
    
    return ration_service
