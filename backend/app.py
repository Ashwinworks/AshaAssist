"""
AshaAssist Backend Application
Main application entry point with modular structure
"""
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Import configuration
from config.settings import config
from config.database import get_database, get_collections, ensure_indexes
from config.firebase import initialize_firebase

# Import middleware
from middleware.auth import init_jwt_middleware

# Import services
from services.auth_service import AuthService
from services.seed_service import SeedService

# Import routes
from routes.auth import init_auth_routes
from routes.maternity import init_maternity_routes
from routes.calendar import init_calendar_routes
from routes.blogs import init_blogs_routes
from routes.vaccination import init_vaccination_routes
from routes.admin import init_admin_routes
from routes.general import init_general_routes
from routes.visit_requests import init_visit_request_routes
from routes.community import init_community_routes

# Import utilities
from utils.helpers import JSONEncoder

def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Set custom JSON encoder
    app.json_encoder = JSONEncoder
    
    # Initialize extensions
    CORS(app)
    jwt = init_jwt_middleware(app)
    
    # Initialize database
    db = get_database()
    collections = get_collections(db)
    ensure_indexes(collections)
    
    # Initialize Firebase
    initialize_firebase()
    
    # Initialize services
    auth_service = AuthService(collections['users'])
    seed_service = SeedService(collections)
    
    # Create default accounts
    auth_service.create_default_accounts()
    
    # Seed default health blogs
    seed_service.create_default_health_blogs()
    
    # Initialize routes
    init_auth_routes(app, collections)
    init_maternity_routes(app, collections)
    init_calendar_routes(app, collections)
    init_blogs_routes(app, collections)
    init_vaccination_routes(app, collections)
    init_admin_routes(app, collections)
    init_general_routes(app, collections)
    init_visit_request_routes(app, collections)
    from routes.palliative import init_palliative_routes
    init_palliative_routes(app, collections)
    init_community_routes(app, collections)
    
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
