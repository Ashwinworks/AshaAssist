"""
Maternal Risk Prediction routes
Provides ML-based risk prediction via RandomForest trained on UCI dataset.
"""
import os
import pickle
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

maternal_risk_bp = Blueprint('maternal_risk', __name__)

# Model loaded once at startup
_model = None
_label_encoder = None


def _load_model():
    """Load model from disk. Called once during app initialisation."""
    global _model, _label_encoder
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, 'models', 'maternal_risk_model.pkl')
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                payload = pickle.load(f)
            _model = payload['model']
            _label_encoder = payload['label_encoder']
            print("[MATERNAL-RISK] Model loaded successfully")
        else:
            print("[MATERNAL-RISK] WARNING: model file not found — using rule-based fallback")
    except Exception as e:
        print(f"[MATERNAL-RISK] Failed to load model: {e}")


def _rule_based_predict(age, systolic, diastolic, bs, temp, heart_rate):
    """Simple rule-based fallback when the ML model isn't available."""
    score = 0
    if systolic >= 140 or diastolic >= 90:
        score += 3
    elif systolic >= 130 or diastolic >= 85:
        score += 1
    if bs >= 11:
        score += 3
    elif bs >= 7.5:
        score += 1
    if temp >= 100:
        score += 2
    if age >= 35:
        score += 1
    if heart_rate >= 90:
        score += 1

    if score >= 5:
        return 'high risk', 0.80
    elif score >= 2:
        return 'mid risk', 0.70
    else:
        return 'low risk', 0.75


def predict_risk(age, systolic_bp, diastolic_bp, bs, body_temp, heart_rate):
    """
    Run risk prediction. Returns (riskLevel, confidence, probabilities).
    riskLevel: 'low risk' | 'mid risk' | 'high risk'
    """
    features = [[float(age), float(systolic_bp), float(diastolic_bp),
                 float(bs), float(body_temp), float(heart_rate)]]

    if _model is not None:
        try:
            import numpy as np
            proba = _model.predict_proba(features)[0]
            predicted_idx = int(proba.argmax())
            risk_level = _label_encoder.inverse_transform([predicted_idx])[0]
            confidence = float(proba[predicted_idx])
            all_probs = {cls: float(p) for cls, p in zip(_label_encoder.classes_, proba)}
            return risk_level, confidence, all_probs
        except Exception as e:
            print(f"[MATERNAL-RISK] Prediction error: {e}")

    # Fallback
    risk_level, confidence = _rule_based_predict(
        age, systolic_bp, diastolic_bp, bs, body_temp, heart_rate
    )
    return risk_level, confidence, {risk_level: confidence}


def _get_recommendations(risk_level: str) -> list:
    recs = {
        'low risk': [
            "Continue routine ANC check-ups as scheduled.",
            "Maintain a balanced diet rich in iron, folic acid, and calcium.",
            "Stay physically active with light walks and prenatal exercises.",
            "Monitor blood pressure and blood sugar at each visit."
        ],
        'mid risk': [
            "Increase ANC visit frequency — consult your doctor about scheduling.",
            "Closely monitor blood pressure at home if possible.",
            "Follow a low-sugar, low-salt diet and stay well-hydrated.",
            "Report any swelling, headaches, or vision changes to your ASHA worker immediately.",
            "Avoid strenuous activity and get adequate rest."
        ],
        'high risk': [
            "⚠️ Seek medical attention promptly — do not delay your next check-up.",
            "Blood pressure and blood sugar must be monitored very closely.",
            "Follow your doctor's medication and dietary instructions strictly.",
            "Have emergency contact numbers ready (ASHA worker, nearest hospital).",
            "Rest as much as possible and avoid any physical strain.",
            "Inform your family members about your risk status."
        ]
    }
    return recs.get(risk_level, recs['low risk'])


def init_maternal_risk_routes(app, collections):
    """Initialise the maternal risk blueprint."""
    _load_model()

    @maternal_risk_bp.route('/api/maternal-risk/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'ready',
            'modelLoaded': _model is not None,
            'fallback': _model is None
        }), 200

    @maternal_risk_bp.route('/api/maternal-risk/predict', methods=['POST'])
    @jwt_required()
    def predict():
        """Predict maternal risk from vitals."""
        try:
            data = request.get_json() or {}
            required = ['age', 'systolicBP', 'diastolicBP', 'bs', 'bodyTemp', 'heartRate']
            for field in required:
                if field not in data:
                    return jsonify({'error': f'Missing field: {field}'}), 400

            risk_level, confidence, all_probs = predict_risk(
                data['age'], data['systolicBP'], data['diastolicBP'],
                data['bs'], data['bodyTemp'], data['heartRate']
            )

            return jsonify({
                'riskLevel': risk_level,
                'confidence': round(confidence * 100, 1),
                'recommendations': _get_recommendations(risk_level),
                'allProbabilities': {k: round(v * 100, 1) for k, v in all_probs.items()},
                'modelUsed': 'ml' if _model else 'rule-based'
            }), 200

        except ValueError as e:
            return jsonify({'error': f'Invalid input: {str(e)}'}), 400
        except Exception as e:
            return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

    app.register_blueprint(maternal_risk_bp)
    return _model is not None
