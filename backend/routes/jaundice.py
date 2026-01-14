"""
Jaundice Detection Routes
AI-powered jaundice screening using pretrained CNN model
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import numpy as np
import cv2
import os
from datetime import datetime, timezone

# TensorFlow imports
try:
    from tensorflow import keras
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("WARNING: TensorFlow not installed. Jaundice detection will use mock predictions.")

# Create blueprint
jaundice_bp = Blueprint('jaundice', __name__)

# Global model variable (loaded once at startup)
model = None
CLASS_LABELS = ["Normal", "Mild Jaundice", "Severe Jaundice"]

def load_model():
    """
    Load the pretrained jaundice detection model
    Model should be placed at: backend/models/jaundice_model.h5
    """
    global model
    
    if not TENSORFLOW_AVAILABLE:
        print("TensorFlow not available, skipping model load")
        return False
    
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'jaundice_model.h5')
    
    if not os.path.exists(model_path):
        print(f"WARNING: Model file not found at {model_path}")
        print("Jaundice detection will use mock predictions")
        return False
    
    try:
        model = keras.models.load_model(model_path)
        print(f"✅ Jaundice detection model loaded successfully from {model_path}")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        return False

def preprocess_image(image_bytes):
    """
    Preprocess image for model inference
    
    Steps:
    1. Decode image from bytes
    2. Resize to 224x224 (MobileNetV2 input size)
    3. Normalize pixel values to 0-1 range
    4. Add batch dimension
    
    Args:
        image_bytes: Raw image bytes from request
        
    Returns:
        Preprocessed numpy array ready for model prediction
    """
    # Step 1: Decode image from bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Failed to decode image")
    
    # Step 2: Convert BGR (OpenCV default) to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Step 3: Resize to 224x224 (model input size)
    img = cv2.resize(img, (224, 224))
    
    # Step 4: Normalize pixel values to 0-1 range
    img = img.astype(np.float32) / 255.0
    
    # Step 5: Add batch dimension (shape becomes [1, 224, 224, 3])
    img = np.expand_dims(img, axis=0)
    
    return img

def get_mock_prediction(image_type):
    """
    Generate mock predictions for testing when model is not available
    Returns realistic-looking random predictions
    """
    # Generate random probabilities that sum to 1
    probs = np.random.dirichlet(np.ones(3))
    
    # Sort to make it more realistic (one class is more confident)
    probs = np.sort(probs)[::-1]
    
    # Get predicted class (highest probability)
    predicted_class_idx = np.argmax(probs)
    
    return {
        'prediction': CLASS_LABELS[predicted_class_idx],
        'confidence': float(probs[predicted_class_idx]),
        'allProbabilities': {
            CLASS_LABELS[0]: float(probs[0]),
            CLASS_LABELS[1]: float(probs[1]),
            CLASS_LABELS[2]: float(probs[2])
        },
        'imageType': image_type,
        'isMockPrediction': True
    }

def init_jaundice_routes(app, collections):
    """Initialize jaundice detection routes with dependencies"""
    
    # Try to load model at startup
    load_model()
    
    @jaundice_bp.route('/api/jaundice/predict', methods=['POST'])
    @jwt_required()
    def predict_jaundice():
        """
        Predict jaundice from uploaded image
        
        Expects:
        - multipart/form-data with 'image' file
        - 'imageType' field: 'eye' or 'skin'
        
        Returns:
        {
            "prediction": "Normal|Mild Jaundice|Severe Jaundice",
            "confidence": 0.95,
            "allProbabilities": {
                "Normal": 0.05,
                "Mild Jaundice": 0.10,
                "Severe Jaundice": 0.85
            },
            "imageType": "eye|skin"
        }
        """
        try:
            # Validate image file is present
            if 'image' not in request.files:
                return jsonify({'error': 'No image file provided'}), 400
            
            file = request.files['image']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Validate image type
            allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
            file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
            if file_ext not in allowed_extensions:
                return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, WEBP'}), 400
            
            # Get image type (eye or skin)
            image_type = request.form.get('imageType', 'eye')
            if image_type not in ['eye', 'skin']:
                return jsonify({'error': 'imageType must be "eye" or "skin"'}), 400
            
            # Read image bytes
            image_bytes = file.read()
            
            # Check file size (limit to 10MB)
            if len(image_bytes) > 10 * 1024 * 1024:
                return jsonify({'error': 'File size must be less than 10MB'}), 400
            
            # If model is not loaded, return mock prediction
            if model is None:
                print("Using mock prediction (model not loaded)")
                result = get_mock_prediction(image_type)
                return jsonify(result), 200
            
            # Preprocess image
            try:
                preprocessed_image = preprocess_image(image_bytes)
            except Exception as e:
                return jsonify({'error': f'Failed to preprocess image: {str(e)}'}), 400
            
            # Run model inference
            try:
                predictions = model.predict(preprocessed_image, verbose=0)
                
                # predictions shape: [1, 3] - probabilities for each class
                probabilities = predictions[0]  # Get first (and only) prediction
                
                # Get predicted class index
                predicted_class_idx = np.argmax(probabilities)
                predicted_class = CLASS_LABELS[predicted_class_idx]
                confidence = float(probabilities[predicted_class_idx])
                
                # Build response
                result = {
                    'prediction': predicted_class,
                    'confidence': confidence,
                    'allProbabilities': {
                        CLASS_LABELS[0]: float(probabilities[0]),
                        CLASS_LABELS[1]: float(probabilities[1]),
                        CLASS_LABELS[2]: float(probabilities[2])
                    },
                    'imageType': image_type,
                    'isMockPrediction': False
                }
                
                return jsonify(result), 200
                
            except Exception as e:
                return jsonify({'error': f'Prediction failed: {str(e)}'}), 500
            
        except Exception as e:
            print(f"Error in jaundice prediction: {str(e)}")
            return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    @jaundice_bp.route('/api/jaundice/health', methods=['GET'])
    def jaundice_health():
        """Check if jaundice detection service is ready"""
        return jsonify({
            'status': 'ready',
            'modelLoaded': model is not None,
            'tensorflowAvailable': TENSORFLOW_AVAILABLE,
            'classes': CLASS_LABELS
        }), 200
    
    # Register blueprint with app
    app.register_blueprint(jaundice_bp)
