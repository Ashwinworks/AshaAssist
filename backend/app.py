"""
AshaAssist Backend Application
Main application entry point with modular structure
"""
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required
from werkzeug.utils import secure_filename
import os
from datetime import datetime

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
from routes.supply import init_supply_routes
from routes.community import init_community_routes
from routes.monthly_ration import init_monthly_ration_routes
from routes.locations import init_locations_routes
from routes.home_visits import init_home_visits_routes
from routes.anganvaadi import init_anganvaadi_routes
from routes.milestones import init_milestone_routes

# Import utilities
from utils.helpers import JSONEncoder

def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Create upload folder if it doesn't exist
    # Use /tmp for serverless environments like Vercel
    upload_folder = app.config['UPLOAD_FOLDER']
    if os.getenv('VERCEL'):
        upload_folder = '/tmp/uploads'
        app.config['UPLOAD_FOLDER'] = upload_folder
    
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Set custom JSON encoder
    app.json_encoder = JSONEncoder
    
    # Configure CORS - Allow all origins for now to test
    # Once working, restrict to specific origins via CORS_ALLOWED_ORIGINS env var
    CORS(app, 
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         expose_headers=['Content-Type', 'Authorization'])
    
    print(f"[CORS DEBUG] CORS enabled for all origins (testing mode)")  # Debug logging
    
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

    # Seed sample supply requests
    seed_service.create_sample_supply_requests()

    # Seed default locations
    seed_service.create_default_locations()

    # Initialize routes
    init_auth_routes(app, collections)
    init_maternity_routes(app, collections)
    init_calendar_routes(app, collections)
    init_blogs_routes(app, collections)
    init_vaccination_routes(app, collections)
    init_admin_routes(app, collections)
    init_general_routes(app, collections)
    init_visit_request_routes(app, collections)
    init_supply_routes(app, collections)
    from routes.palliative import init_palliative_routes
    init_palliative_routes(app, collections)
    init_community_routes(app, collections)
    init_monthly_ration_routes(app, collections)
    init_locations_routes(app, collections)
    init_home_visits_routes(app, collections)
    init_anganvaadi_routes(app, collections)
    init_milestone_routes(app, collections)
    
    # Initialize jaundice detection routes (AI model)
    from routes.jaundice import init_jaundice_routes
    init_jaundice_routes(app, collections)
    
    # Initialize chatbot routes (Mistral AI)
    from routes.chatbot import init_chatbot_routes
    init_chatbot_routes(app)
    
    # Initialize translation routes (Argos Translate)
    from routes.translation import translation_bp
    app.register_blueprint(translation_bp)
    
    # File upload endpoint
    @app.route('/api/upload', methods=['POST'])
    @jwt_required()
    def upload_file():
        """Upload a file (photos, documents, etc.)"""
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Check file size (5MB limit)
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)
            
            if file_size > 5 * 1024 * 1024:
                return jsonify({'error': 'File size must be less than 5MB'}), 400
            
            # Secure the filename and add timestamp
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            
            # Save the file
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Return the file URL
            file_url = f"/uploads/{filename}"
            return jsonify({'fileUrl': file_url}), 200
            
        except Exception as e:
            print(f"Error uploading file: {str(e)}")
            return jsonify({'error': f'Failed to upload file: {str(e)}'}), 500
    
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
