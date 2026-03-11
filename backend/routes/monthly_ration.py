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

    # Mapping: ration item name -> (stock itemName, quantity to deduct)
    RATION_STOCK_MAP = {
        'Rice 8kg':                              ('Rice', 8),
        'Wheat 4kg':                             ('Wheat', 4),
        'Lentils 2kg':                           ('Lentils', 2),
        'Oil 2L':                                ('Oil', 2),
        'Sugar 2kg':                             ('Sugar', 2),
        'Child Oil 400ml':                       ('Child Oil', 400),
        'Iron and Folic Acid (IFA) tablets':     ('Iron and Folic Acid (IFA) tablets', 30),
        'Calcium tablets':                       ('Calcium tablets', 30),
        'Vitamin A':                             ('Vitamin A', 1),
        'Amrutham Nutrimix (Amrutham Podi)':     ('Amrutham Nutrimix (Amrutham Podi)', 1),
    }

    def _deduct_stock_for_ration(stock_collection):
        """Deduct standard ration quantities from anganwadi stock"""
        if stock_collection is None:
            return
        try:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            for ration_item, (stock_name, qty) in RATION_STOCK_MAP.items():
                # Find matching stock item (case-insensitive)
                stock_item = stock_collection.find_one({
                    'itemName': {'$regex': f'^{stock_name}$', '$options': 'i'}
                })
                if stock_item and stock_item.get('quantity', 0) >= qty:
                    new_qty = stock_item['quantity'] - qty
                    stock_collection.update_one(
                        {'_id': stock_item['_id']},
                        {
                            '$set': {
                                'quantity': max(0, new_qty),
                                'lastUpdated': now,
                                'updatedAt': now,
                            },
                            '$push': {
                                'usageLog': {
                                    'date': now.isoformat(),
                                    'quantityUsed': qty,
                                    'reason': 'Monthly ration collection',
                                    'balanceAfter': max(0, new_qty),
                                }
                            }
                        }
                    )
        except Exception as e:
            print(f"[Stock] Warning: could not deduct stock for ration: {e}")
    
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

            # If successfully marked as collected, deduct from anganwadi stock
            if status_code == 200:
                _deduct_stock_for_ration(collections.get('anganwadi_stock'))

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

    @monthly_ration_bp.route('/api/monthly-rations/update-items', methods=['POST'])
    @jwt_required()
    def update_ration_items():
        """Update all ration records with latest items (Admin/Anganvaadi only)"""
        try:
            current_user_id = get_jwt_identity()
            current_user = collections['users'].find_one({'_id': ObjectId(current_user_id)})
            
            # Only anganvaadi workers or admins can update items
            if not current_user or current_user.get('userType') not in ['anganvaadi', 'admin']:
                return jsonify({'error': 'Access denied. Anganvaadi workers or admins only.'}), 403
            
            result, status_code = ration_service.update_all_ration_items()
            return jsonify(result), status_code
        except Exception as e:
            return jsonify({'error': f'Failed to update ration items: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(monthly_ration_bp)
    
    return ration_service
