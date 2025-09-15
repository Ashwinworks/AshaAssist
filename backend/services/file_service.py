"""
File upload and management service
"""
import os
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
from config.settings import Config

class FileService:
    def __init__(self):
        self.upload_folder = Config.UPLOAD_FOLDER
        self.max_content_length = Config.MAX_CONTENT_LENGTH

    def ensure_uploads_dir(self):
        """Ensure uploads directory exists"""
        uploads_dir = os.path.join(os.getcwd(), self.upload_folder)
        os.makedirs(uploads_dir, exist_ok=True)
        return uploads_dir

    def save_uploaded_file(self, file, prefix="file"):
        """Save uploaded file and return the URL"""
        if not file or not file.filename:
            return None
        
        uploads_dir = self.ensure_uploads_dir()
        
        # Create unique filename
        ts = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')
        ext = os.path.splitext(secure_filename(file.filename))[1]
        filename = f"{prefix}_{ts}{ext}"
        save_path = os.path.join(uploads_dir, filename)
        
        try:
            file.save(save_path)
            # Return absolute URL for proper serving
            return f"/uploads/{filename}"
        except Exception as e:
            print(f"Error saving file {filename}: {e}")
            return None

    def delete_file(self, filename):
        """Delete a file from uploads directory"""
        try:
            file_path = os.path.join(os.getcwd(), self.upload_folder, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception as e:
            print(f"Error deleting file {filename}: {e}")
        return False

    def get_file_path(self, filename):
        """Get full path to a file in uploads directory"""
        return os.path.join(os.getcwd(), self.upload_folder, filename)
