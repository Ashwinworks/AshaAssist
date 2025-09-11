"""
Maternity-specific routes for pregnancy tracking and management
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.maternity_service import MaternityService

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

    # Register blueprint with app
    app.register_blueprint(maternity_bp)
    
    return maternity_service
