"""
Government Benefits routes for managing benefit programs like PMSMA
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.government_benefits_service import GovernmentBenefitsService
from bson import ObjectId


def init_government_benefits_routes(app, collections):
    """Initialize government benefits routes with dependencies"""
    
    benefits_bp = Blueprint('government_benefits', __name__)
    benefits_service = GovernmentBenefitsService(
        collections['users'],
        collections['visits']
    )

    @benefits_bp.route('/api/benefits/pmsma/summary', methods=['GET'])
    @jwt_required()
    def get_pmsma_summary():
        """Get PMSMA benefit summary for authenticated user"""
        try:
            user_id = get_jwt_identity()
            response, status = benefits_service.get_benefit_summary(user_id)
            return jsonify(response), status
        except Exception as e:
            return jsonify({'error': f'Failed to get benefit summary: {str(e)}'}), 500

    @benefits_bp.route('/api/benefits/pmsma/initialize', methods=['POST'])
    @jwt_required()
    def initialize_pmsma():
        """Initialize PMSMA benefits for authenticated user (usually called during pregnancy registration)"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            
            confirmation_date = data.get('confirmationDate')
            lmp = data.get('lmp')
            
            response, status = benefits_service.initialize_pmsma(user_id, confirmation_date, lmp)
            return jsonify(response), status
        except Exception as e:
            return jsonify({'error': f'Failed to initialize PMSMA: {str(e)}'}), 500

    @benefits_bp.route('/api/benefits/pmsma/mark-paid', methods=['POST'])
    @jwt_required()
    def mark_installment_paid():
        """Mark an installment as paid (ASHA worker/admin action)"""
        try:
            current_user_id = get_jwt_identity()
            
            # Get current user to check role
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            # Only ASHA workers and admins can mark as paid
            if current_user.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers and admins can mark payments'}), 403
            
            data = request.get_json() or {}
            
            user_id = data.get('userId')
            installment_number = data.get('installmentNumber')
            transaction_id = data.get('transactionId')
            
            if not user_id or not installment_number:
                return jsonify({'error': 'userId and installmentNumber are required'}), 400
            
            response, status = benefits_service.mark_installment_paid(
                user_id,
                installment_number,
                transaction_id
            )
            return jsonify(response), status
        except Exception as e:
            return jsonify({'error': f'Failed to mark installment as paid: {str(e)}'}), 500

    @benefits_bp.route('/api/benefits/pmsma/user/<user_id>', methods=['GET'])
    @jwt_required()
    def get_user_pmsma_summary(user_id):
        """Get PMSMA benefit summary for a specific user (ASHA worker view)"""
        try:
            current_user_id = get_jwt_identity()
            print(f"[DEBUG] Fetching benefits for user_id: {user_id}")
            print(f"[DEBUG] Current ASHA worker JWT identity: {current_user_id}")
            print(f"[DEBUG] Looking up ASHA worker with ObjectId: {ObjectId(current_user_id)}")
            
            # Get current user to check role
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            print(f"[DEBUG] ASHA worker found: {current_user is not None}")
            if current_user:
                print(f"[DEBUG] ASHA worker email: {current_user.get('email')}, userType: {current_user.get('userType')}")
            
            if not current_user:
                print(f"[DEBUG] ERROR: Could not find user with ID {current_user_id}")
                return jsonify({'error': 'User not found'}), 404
            
            # Only ASHA workers and admins can view other users' benefits
            if current_user.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers and admins can view other users\' benefits'}), 403
            
            response, status = benefits_service.get_benefit_summary(user_id)
            return jsonify(response), status
        except Exception as e:
            return jsonify({'error': f'Failed to get benefit summary: {str(e)}'}), 500

    @benefits_bp.route('/api/benefits/pmsma/mothers', methods=['GET'])
    @jwt_required()
    def get_all_mothers():
        """Get all maternity users for ASHA worker view"""
        try:
            current_user_id = get_jwt_identity()
            
            # Get current user to check role
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            # Only ASHA workers and admins can view
            if current_user.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers and admins can access this'}), 403
            
            # Get all maternity users
            maternity_users = list(collections['users'].find({
                'beneficiaryCategory': 'maternity'
            }))
            
            # Format response
            mothers = []
            for user in maternity_users:
                mothers.append({
                    'id': str(user['_id']),
                    'name': user.get('name', 'Unknown'),
                    'email': user.get('email', ''),
                    'phone': user.get('phone', ''),
                    'lmp': user.get('maternalHealth', {}).get('lmp') or user.get('lmpDate'),
                    'hasPMSMA': 'governmentBenefits' in user and 'pmsma' in user.get('governmentBenefits', {})
                })
            
            return jsonify({'mothers': mothers}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to get mothers: {str(e)}'}), 500

    # Register blueprint
    app.register_blueprint(benefits_bp)

    return benefits_bp
