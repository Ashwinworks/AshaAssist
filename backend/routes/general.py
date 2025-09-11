"""
General routes for common functionality
"""
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
import os

# Create blueprint
general_bp = Blueprint('general', __name__)

def init_general_routes(app, collections):
    """Initialize general routes with dependencies"""
    
    @general_bp.route('/', methods=['GET'])
    def home():
        """API home endpoint"""
        return jsonify({
            'message': 'Welcome to AshaAssist API',
            'version': '1.0.0',
            'status': 'running'
        })

    @general_bp.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        try:
            # Test database connection
            collections['users'].database.command('ping')
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 500

    @general_bp.route('/api/asha-feedback', methods=['POST'])
    @jwt_required()
    def submit_asha_feedback():
        """Submit ASHA feedback"""
        try:
            user_id = get_jwt_identity()
            data = request.get_json() or {}
            
            # Basic validation
            rating = int(data.get('rating', 0))
            if rating < 1 or rating > 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            
            feedback_doc = {
                'userId': ObjectId(user_id),
                'ashaWorkerId': data.get('ashaWorkerId'),  # optional for now
                'rating': rating,
                'timeliness': int(data.get('timeliness', rating)),
                'communication': int(data.get('communication', rating)),
                'supportiveness': int(data.get('supportiveness', rating)),
                'comments': (data.get('comments') or '').strip(),
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc)
            }
            
            result = collections['asha_feedback'].insert_one(feedback_doc)
            return jsonify({'message': 'Feedback submitted', 'id': str(result.inserted_id)}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to submit feedback: {str(e)}'}), 500

    @general_bp.route('/api/asha-feedback', methods=['GET'])
    @jwt_required()
    def list_my_asha_feedback():
        """List user's own ASHA feedback"""
        try:
            user_id = get_jwt_identity()
            cursor = collections['asha_feedback'].find({'userId': ObjectId(user_id)}).sort('createdAt', -1)
            items = []
            for doc in cursor:
                doc['id'] = str(doc['_id'])
                doc.pop('_id', None)
                doc['userId'] = str(doc['userId'])
                items.append(doc)
            return jsonify({'feedbacks': items}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to load feedback: {str(e)}'}), 500

    @general_bp.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        """Serve uploaded files"""
        uploads_dir = os.path.join(os.getcwd(), 'uploads')
        return send_from_directory(uploads_dir, filename)

    # Register blueprint with app
    app.register_blueprint(general_bp)

