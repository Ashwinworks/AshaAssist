"""
Stock management routes for Anganvaadi workers
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.stock_service import StockService
from bson import ObjectId

stock_bp = Blueprint('stock', __name__)


def init_stock_routes(app, collections):
    """Initialize stock management routes"""
    stock_service = StockService(collections['anganwadi_stock'])

    def _require_anganvaadi(user_id):
        """Helper: verify the user is an Anganvaadi worker"""
        user = collections['users'].find_one({'_id': ObjectId(user_id)})
        if not user or user.get('userType') != 'anganvaadi':
            return None
        return user

    @stock_bp.route('/api/stock', methods=['GET'])
    @jwt_required()
    def get_all_stock():
        """Get all stock items"""
        user_id = get_jwt_identity()
        if not _require_anganvaadi(user_id):
            return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
        result, status = stock_service.get_all_stock()
        return jsonify(result), status

    @stock_bp.route('/api/stock', methods=['POST'])
    @jwt_required()
    def add_stock_item():
        """Add a new stock item"""
        user_id = get_jwt_identity()
        if not _require_anganvaadi(user_id):
            return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
        data = request.get_json() or {}
        result, status = stock_service.add_stock_item(data)
        return jsonify(result), status

    @stock_bp.route('/api/stock/<item_id>', methods=['PUT'])
    @jwt_required()
    def update_stock_item(item_id):
        """Update a stock item"""
        user_id = get_jwt_identity()
        if not _require_anganvaadi(user_id):
            return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
        data = request.get_json() or {}
        result, status = stock_service.update_stock_item(item_id, data)
        return jsonify(result), status

    @stock_bp.route('/api/stock/<item_id>', methods=['DELETE'])
    @jwt_required()
    def delete_stock_item(item_id):
        """Delete a stock item"""
        user_id = get_jwt_identity()
        if not _require_anganvaadi(user_id):
            return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
        result, status = stock_service.delete_stock_item(item_id)
        return jsonify(result), status

    @stock_bp.route('/api/stock/low', methods=['GET'])
    @jwt_required()
    def get_low_stock():
        """Get low-stock alerts"""
        user_id = get_jwt_identity()
        if not _require_anganvaadi(user_id):
            return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
        result, status = stock_service.get_low_stock_items()
        return jsonify(result), status

    @stock_bp.route('/api/stock/<item_id>/usage', methods=['POST'])
    @jwt_required()
    def record_usage(item_id):
        """Record stock usage (deduct quantity)"""
        user_id = get_jwt_identity()
        if not _require_anganvaadi(user_id):
            return jsonify({'error': 'Access denied. Anganvaadi workers only.'}), 403
        data = request.get_json() or {}
        result, status = stock_service.record_stock_usage(item_id, data)
        return jsonify(result), status

    @stock_bp.route('/api/stock/availability', methods=['GET'])
    @jwt_required()
    def get_stock_availability():
        """Public endpoint: any authenticated user can see what's available"""
        result, status = stock_service.get_all_stock()
        if status != 200:
            return jsonify(result), status
        # Return simplified view for mothers — hide thresholds and usage logs
        simplified = []
        for item in result.get('items', []):
            simplified.append({
                'itemName': item['itemName'],
                'category': item['category'],
                'quantity': item['quantity'],
                'unit': item['unit'],
                'status': item['status'],  # ok, low, out_of_stock
            })
        return jsonify({'items': simplified}), 200

    app.register_blueprint(stock_bp)
    return stock_service
