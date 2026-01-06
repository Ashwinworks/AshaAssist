"""
Translation API routes for dynamic content translation.
Provides endpoints for translating text using Argos Translate.
"""

from flask import Blueprint, request, jsonify
from services.translation_service import get_translation_service
import logging

logger = logging.getLogger(__name__)

translation_bp = Blueprint('translation', __name__)


@translation_bp.route('/api/translate', methods=['POST'])
def translate_text():
    """
    Translate text from one language to another.
    
    Request body:
        {
            "text": "Text to translate",
            "source_lang": "en" (optional, default: "en"),
            "target_lang": "ml" (optional, default: "ml")
        }
    
    Response:
        {
            "translated_text": "Translated text",
            "source_lang": "en",
            "target_lang": "ml",
            "original_text": "Original text"
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text']
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'ml')
        
        # Validate language codes
        valid_langs = ['en', 'ml']
        if source_lang not in valid_langs or target_lang not in valid_langs:
            return jsonify({
                'error': f'Invalid language code. Supported: {valid_langs}'
            }), 400
        
        # Get translation service
        service = get_translation_service()
        
        # Translate text
        translated_text = service.translate(text, source_lang, target_lang)
        
        return jsonify({
            'translated_text': translated_text,
            'source_lang': source_lang,
            'target_lang': target_lang,
            'original_text': text
        }), 200
        
    except Exception as e:
        logger.error(f"Translation endpoint error: {str(e)}")
        return jsonify({
            'error': 'Translation failed',
            'details': str(e)
        }), 500


@translation_bp.route('/api/translate/batch', methods=['POST'])
def translate_batch():
    """
    Translate multiple texts at once.
    
    Request body:
        {
            "texts": ["Text 1", "Text 2", "Text 3"],
            "source_lang": "en" (optional, default: "en"),
            "target_lang": "ml" (optional, default: "ml")
        }
    
    Response:
        {
            "translated_texts": ["Translated 1", "Translated 2", "Translated 3"],
            "source_lang": "en",
            "target_lang": "ml",
            "count": 3
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'error': 'Missing required field: texts'
            }), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list):
            return jsonify({
                'error': 'texts must be a list'
            }), 400
        
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'ml')
        
        # Validate language codes
        valid_langs = ['en', 'ml']
        if source_lang not in valid_langs or target_lang not in valid_langs:
            return jsonify({
                'error': f'Invalid language code. Supported: {valid_langs}'
            }), 400
        
        # Get translation service
        service = get_translation_service()
        
        # Translate all texts
        translated_texts = service.translate_batch(texts, source_lang, target_lang)
        
        return jsonify({
            'translated_texts': translated_texts,
            'source_lang': source_lang,
            'target_lang': target_lang,
            'count': len(translated_texts)
        }), 200
        
    except Exception as e:
        logger.error(f"Batch translation endpoint error: {str(e)}")
        return jsonify({
            'error': 'Batch translation failed',
            'details': str(e)
        }), 500


@translation_bp.route('/api/translate/status', methods=['GET'])
def translation_status():
    """
    Check translation service status.
    
    Response:
        {
            "initialized": true,
            "supported_languages": ["en", "ml"],
            "available_directions": ["en->ml", "ml->en"]
        }
    """
    try:
        service = get_translation_service()
        
        return jsonify({
            'initialized': service.initialized,
            'supported_languages': ['en', 'ml'],
            'available_directions': ['en->ml', 'ml->en']
        }), 200
        
    except Exception as e:
        logger.error(f"Status endpoint error: {str(e)}")
        return jsonify({
            'error': 'Failed to get status',
            'details': str(e)
        }), 500
