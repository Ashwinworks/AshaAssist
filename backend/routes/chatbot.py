"""
Chatbot routes for AshaAssist AI Copilot
Uses Mistral AI API for healthcare-focused assistance
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os

chatbot_bp = Blueprint('chatbot', __name__)

# Mistral AI Configuration
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

# System prompt to focus the AI on AshaAssist-related topics
SYSTEM_PROMPT = """You are AshaAssist Copilot, a helpful AI assistant for the AshaAssist healthcare platform in India.

AshaAssist is a platform that connects:
- ASHA (Accredited Social Health Activist) workers
- Maternity care beneficiaries (pregnant women and new mothers)
- Palliative care patients and their families
- Anganwadi workers (child development center workers)

Your responsibilities:
1. **Maternity Care**: Answer questions about pregnancy, prenatal care, nutrition during pregnancy, breastfeeding, newborn care, vaccinations for infants, antenatal visits, and postnatal care.

2. **Palliative Care**: Provide compassionate guidance on managing chronic conditions, pain management tips, emotional support resources, caregiver wellness, and end-of-life care considerations.

3. **ASHA Worker Support**: Help with information about home visits, health camps, community classes, vaccination schedules, and beneficiary support.

4. **Platform Features**: Guide users on how to use AshaAssist features like:
   - Booking vaccination appointments
   - Requesting supplies (IFA tablets, nutrition kits)
   - Viewing health blogs
   - Checking calendar events
   - Tracking milestones (for maternity users)
   - Recording health records
   - Submitting feedback

IMPORTANT RULES:
- Respond in a friendly, supportive, and culturally sensitive manner appropriate for Indian users.
- Keep responses concise and practical.
- If asked about topics UNRELATED to healthcare, maternity, palliative care, or the AshaAssist platform, politely redirect: "I'm designed to help with maternity care, palliative care, and AshaAssist platform questions. Is there something health-related I can help you with?"
- Never provide specific medical diagnoses. Encourage users to consult healthcare professionals for medical advice.
- Support both English and Malayalam speakers (many users in Kerala).
- Be empathetic, especially when discussing sensitive topics like pregnancy complications or palliative care.

You are here to support and empower users on their healthcare journey!"""


def init_chatbot_routes(app):
    """Initialize chatbot routes"""
    
    @chatbot_bp.route('/chat', methods=['POST'])
    @jwt_required()
    def chat():
        """Handle chat messages and get AI response from Mistral"""
        try:
            # Read API key at runtime (not at import time) for deployment compatibility
            api_key = os.getenv('MISTRAL_API_KEY')
            
            # Check if API key is configured
            if not api_key:
                print("MISTRAL_API_KEY environment variable is not set!")
                return jsonify({
                    'error': 'Chatbot service is not configured. Please contact administrator.'
                }), 503
            
            # Get message from request
            data = request.get_json()
            if not data or 'message' not in data:
                return jsonify({'error': 'Message is required'}), 400
            
            user_message = data['message'].strip()
            if not user_message:
                return jsonify({'error': 'Message cannot be empty'}), 400
            
            # Get current user for context (optional enhancement)
            current_user_id = get_jwt_identity()
            
            # Prepare Mistral API request
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            }
            
            payload = {
                'model': 'mistral-small-latest',
                'messages': [
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': user_message}
                ],
                'temperature': 0.7,
                'max_tokens': 500
            }
            
            # Call Mistral API
            response = requests.post(
                MISTRAL_API_URL,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"Mistral API error: {response.status_code} - {response.text}")
                return jsonify({
                    'error': 'Failed to get response from AI service. Please try again.'
                }), 502
            
            result = response.json()
            
            # Extract the assistant's reply
            if 'choices' in result and len(result['choices']) > 0:
                reply = result['choices'][0]['message']['content']
                return jsonify({'reply': reply}), 200
            else:
                return jsonify({
                    'error': 'Unexpected response from AI service.'
                }), 502
                
        except requests.exceptions.Timeout:
            return jsonify({
                'error': 'AI service is taking too long. Please try again.'
            }), 504
        except requests.exceptions.RequestException as e:
            print(f"Request error: {str(e)}")
            return jsonify({
                'error': 'Unable to connect to AI service. Please check your internet connection.'
            }), 503
        except Exception as e:
            print(f"Chatbot error: {str(e)}")
            return jsonify({
                'error': 'An unexpected error occurred. Please try again.'
            }), 500
    
    # Register blueprint
    app.register_blueprint(chatbot_bp, url_prefix='/api')
