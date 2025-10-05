"""
Locations management routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId

locations_bp = Blueprint('locations', __name__)

def init_locations_routes(app, collections):
    """Initialize locations routes with dependencies"""

    @locations_bp.route('/api/locations', methods=['GET'])
    @jwt_required()
    def get_locations():
        """Get all active locations for dropdown"""
        try:
            # Optional ward filter
            ward = request.args.get('ward')

            query = {'active': True}
            if ward:
                query['ward'] = ward

            locations = list(collections['locations'].find(query).sort('name', 1))

            # Convert ObjectId to string
            for loc in locations:
                loc['_id'] = str(loc['_id'])
                loc['createdAt'] = loc.get('createdAt').isoformat() if loc.get('createdAt') and hasattr(loc['createdAt'], 'isoformat') else None
                loc['updatedAt'] = loc.get('updatedAt').isoformat() if loc.get('updatedAt') and hasattr(loc['updatedAt'], 'isoformat') else None

            return jsonify({'locations': locations}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to load locations: {str(e)}'}), 500

    @locations_bp.route('/api/locations', methods=['POST'])
    @jwt_required()
    def create_location():
        """Create a new location (admin only)"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') != 'admin':
                return jsonify({'error': 'Only admins can manage locations'}), 403

            data = request.get_json() or {}
            name = (data.get('name') or '').strip()
            location_type = (data.get('type') or '').strip()
            ward = (data.get('ward') or '').strip()

            if not all([name, location_type, ward]):
                return jsonify({'error': 'Name, type, and ward are required'}), 400

            # Check if location already exists
            existing = collections['locations'].find_one({
                'name': name,
                'ward': ward
            })
            if existing:
                return jsonify({'error': 'Location already exists'}), 409

            doc = {
                'name': name,
                'type': location_type,
                'ward': ward,
                'address': (data.get('address') or '').strip(),
                'active': True,
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc)
            }

            res = collections['locations'].insert_one(doc)
            return jsonify({'id': str(res.inserted_id), 'message': 'Location created'}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create location: {str(e)}'}), 500

    @locations_bp.route('/api/locations/<location_id>', methods=['PUT'])
    @jwt_required()
    def update_location(location_id):
        """Update a location (admin only)"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') != 'admin':
                return jsonify({'error': 'Only admins can manage locations'}), 403

            data = request.get_json() or {}
            updates = {}

            for field in ['name', 'type', 'ward', 'address']:
                if field in data:
                    updates[field] = (data.get(field) or '').strip()

            if 'active' in data:
                updates['active'] = bool(data['active'])

            if not updates:
                return jsonify({'error': 'No updates provided'}), 400

            updates['updatedAt'] = datetime.now(timezone.utc)
            collections['locations'].update_one({'_id': ObjectId(location_id)}, {'$set': updates})
            return jsonify({'message': 'Location updated'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update location: {str(e)}'}), 500

    @locations_bp.route('/api/locations/<location_id>', methods=['DELETE'])
    @jwt_required()
    def delete_location(location_id):
        """Delete a location (admin only)"""
        try:
            claims = get_jwt() or {}
            if claims.get('userType') != 'admin':
                return jsonify({'error': 'Only admins can manage locations'}), 403

            # Soft delete by setting active to false
            collections['locations'].update_one(
                {'_id': ObjectId(location_id)},
                {'$set': {'active': False, 'updatedAt': datetime.now(timezone.utc)}}
            )
            return jsonify({'message': 'Location deactivated'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to delete location: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(locations_bp)