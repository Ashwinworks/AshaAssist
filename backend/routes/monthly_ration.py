"""
Monthly ration routes for Anganvaadi and maternity users
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.monthly_ration_service import MonthlyRationService
from bson import ObjectId

# Create blueprint
monthly_ration_bp = Blueprint('monthly_ration', __name__)

def init_monthly_ration_routes(app, collections):
    """Initialize monthly ration routes with dependencies"""
    ration_service = MonthlyRationService(
        collections['users'], 
        collections['monthly_rations']
    )
    
    @monthly_ration_bp.route('/api/monthly-rations', methods=['GET'])
    @jwt_required()
    def get_monthly_rations():
        """Get all monthly rations for a specific month (Anganvaadi view)"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only anganvaadi workers can view all rations
            if not user or user.get('userType') != 'anganvaadi':
                return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
            
            month_start_date = request.args.get('monthStartDate')
            result, status_code = ration_service.get_rations_for_month(month_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch monthly rations: {str(e)}'}), 500

    @monthly_ration_bp.route('/api/monthly-rations/my-status', methods=['GET'])
    @jwt_required()
    def get_my_ration_status():
        """Get current user's ration status for the month (Maternity user view)"""
        try:
            user_id = get_jwt_identity()
            user = collections['users'].find_one({'_id': ObjectId(user_id)})
            
            # Only maternity users can check their own status
            if not user or user.get('beneficiaryCategory') != 'maternity':
                return jsonify({'error': 'Access denied. Maternity users only.'}), 403
            
            month_start_date = request.args.get('monthStartDate')
            result, status_code = ration_service.get_user_ration_status(user_id, month_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch ration status: {str(e)}'}), 500

    @monthly_ration_bp.route('/api/monthly-rations/mark-collected', methods=['PUT'])
    @jwt_required()
    def mark_collected():
        """Mark ration as collected (can be called by maternity user or anganvaadi)"""
        try:
            current_user_id = get_jwt_identity()
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            data = request.get_json() or {}
            month_start_date = data.get('monthStartDate')
            
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
            
            result, status_code = ration_service.mark_ration_collected(user_id, month_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to mark ration as collected: {str(e)}'}), 500

    @monthly_ration_bp.route('/api/monthly-rations/mark-pending', methods=['PUT'])
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
            month_start_date = data.get('monthStartDate')
            
            if not user_id:
                return jsonify({'error': 'userId is required'}), 400
            
            result, status_code = ration_service.mark_ration_pending(user_id, month_start_date)
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to mark ration as pending: {str(e)}'}), 500

    @monthly_ration_bp.route('/api/monthly-rations/history', methods=['GET'])
    @jwt_required()
    def get_ration_history():
        """Get ration history for all months (Anganvaadi only)"""
        try:
            current_user_id = get_jwt_identity()
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            
            # Only anganvaadi workers can view history
            if not current_user or current_user.get('userType') != 'anganvaadi':
                return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
            
            result, status_code = ration_service.get_ration_history()
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to fetch ration history: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(monthly_ration_bp)
    
    return ration_service
