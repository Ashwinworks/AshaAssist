"""
Health blogs management routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
from services.file_service import FileService
from utils.svg_generator import generate_svg_banner, slugify

# Create blueprint
blogs_bp = Blueprint('blogs', __name__)

def init_blogs_routes(app, collections):
    """Initialize health blogs routes with dependencies"""
    file_service = FileService()
    
    @blogs_bp.route('/api/health-blogs', methods=['POST'])
    @jwt_required()
    def create_health_blog():
        """Create a new health blog"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt() or {}
            if claims.get('userType') not in ['asha_worker', 'admin']:
                return jsonify({'error': 'Only ASHA workers or admins can create blogs'}), 403

            # Support both JSON and multipart (for image upload)
            data = {}
            if request.content_type and 'multipart/form-data' in request.content_type:
                data['title'] = (request.form.get('title') or '').strip()
                data['content'] = (request.form.get('content') or '').strip()
                data['category'] = (request.form.get('category') or 'general').strip().lower()
                data['authorName'] = (request.form.get('authorName') or '').strip()
                image_file = request.files.get('image')
            else:
                data = request.get_json() or {}
                image_file = None

            # Validate required fields
            if not data.get('title') or not data.get('content') or not data.get('authorName'):
                return jsonify({'error': 'title, content, and authorName are required'}), 400

            # Save image if provided
            image_url = None
            if image_file:
                image_url = file_service.save_uploaded_file(image_file, "blog")

            doc = {
                'title': data['title'].strip(),
                'content': data['content'].strip(),
                'category': (data.get('category') or 'general').strip().lower(),
                'authorName': data['authorName'].strip(),
                'imageUrl': image_url,
                'status': (data.get('status') or 'published').strip().lower(),  # published|draft
                'createdBy': ObjectId(user_id),
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc),
                'views': 0,
                'likes': 0,
                'tags': data.get('tags') or []
            }
            result = collections['health_blogs'].insert_one(doc)
            return jsonify({'message': 'Blog created', 'id': str(result.inserted_id)}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create blog: {str(e)}'}), 500

    @blogs_bp.route('/api/health-blogs', methods=['GET'])
    @jwt_required()
    def list_health_blogs():
        """List health blogs with optional filters"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            
            # filters
            category = (request.args.get('category') or '').strip().lower() or None
            status = (request.args.get('status') or '').strip().lower() or None
            created_by = (request.args.get('createdBy') or '').strip() or None

            query = {}
            if category:
                query['category'] = category
            if status:
                query['status'] = status
            else:
                # Default for non-admin/non-asha: show published only
                if user_type not in ['admin', 'asha_worker']:
                    query['status'] = 'published'
            if created_by:
                try:
                    query['createdBy'] = ObjectId(created_by)
                except Exception:
                    pass

            cursor = collections['health_blogs'].find(query).sort('createdAt', -1)
            items = []
            for doc in cursor:
                doc['id'] = str(doc['_id'])
                doc.pop('_id', None)
                doc['createdBy'] = str(doc['createdBy'])
                if isinstance(doc.get('createdAt'), datetime):
                    doc['createdAt'] = doc['createdAt'].isoformat()
                if isinstance(doc.get('updatedAt'), datetime):
                    doc['updatedAt'] = doc['updatedAt'].isoformat()
                items.append(doc)
            return jsonify({'blogs': items}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list blogs: {str(e)}'}), 500

    @blogs_bp.route('/api/health-blogs/<blog_id>', methods=['GET'])
    @jwt_required()
    def get_health_blog(blog_id):
        """Get a specific health blog"""
        try:
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            doc = collections['health_blogs'].find_one({'_id': ObjectId(blog_id)})
            if not doc:
                return jsonify({'error': 'Blog not found'}), 404
            
            # Restrict access: non-admin/non-asha can only read published
            if user_type not in ['admin', 'asha_worker'] and doc.get('status') != 'published':
                return jsonify({'error': 'Not allowed'}), 403
            
            doc['id'] = str(doc['_id'])
            doc.pop('_id', None)
            doc['createdBy'] = str(doc['createdBy'])
            if isinstance(doc.get('createdAt'), datetime):
                doc['createdAt'] = doc['createdAt'].isoformat()
            if isinstance(doc.get('updatedAt'), datetime):
                doc['updatedAt'] = doc['updatedAt'].isoformat()
            return jsonify({'blog': doc}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to get blog: {str(e)}'}), 500

    @blogs_bp.route('/api/health-blogs/<blog_id>', methods=['PUT'])
    @jwt_required()
    def update_health_blog(blog_id):
        """Update a health blog"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            is_privileged = user_type in ['admin', 'asha_worker']
            data = request.get_json() or {}

            # Only creator or privileged (admin/ASHA) can edit
            existing = collections['health_blogs'].find_one({'_id': ObjectId(blog_id)})
            if not existing:
                return jsonify({'error': 'Blog not found'}), 404
            if not is_privileged and str(existing['createdBy']) != str(ObjectId(user_id)):
                return jsonify({'error': 'Not allowed'}), 403

            update = {k: v for k, v in {
                'title': data.get('title'),
                'content': data.get('content'),
                'category': (data.get('category') or '').strip().lower() if data.get('category') else None,
                'authorName': data.get('authorName'),
                'status': (data.get('status') or '').strip().lower() if data.get('status') else None,
                'tags': data.get('tags')
            }.items() if v is not None}
            update['updatedAt'] = datetime.now(timezone.utc)
            collections['health_blogs'].update_one({'_id': ObjectId(blog_id)}, {'$set': update})
            return jsonify({'message': 'Blog updated'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to update blog: {str(e)}'}), 500

    @blogs_bp.route('/api/health-blogs/<blog_id>', methods=['DELETE'])
    @jwt_required()
    def delete_health_blog(blog_id):
        """Delete a health blog"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt() or {}
            user_type = claims.get('userType')
            is_privileged = user_type in ['admin', 'asha_worker']
            existing = collections['health_blogs'].find_one({'_id': ObjectId(blog_id)})
            if not existing:
                return jsonify({'error': 'Blog not found'}), 404
            if not is_privileged and str(existing['createdBy']) != str(ObjectId(user_id)):
                return jsonify({'error': 'Not allowed'}), 403
            collections['health_blogs'].delete_one({'_id': ObjectId(blog_id)})
            return jsonify({'message': 'Blog deleted'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to delete blog: {str(e)}'}), 500

    # Register blueprint with app
    app.register_blueprint(blogs_bp)
    
    return file_service
