"""
Translation service using deep-translator for offline translation.
Provides English-Malayalam translation for dynamic content.
"""

from deep_translator import GoogleTranslator
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


class TranslationService:
    """Service for translating dynamic content using deep-translator"""
    
    def __init__(self):
        self.initialized = True
        logger.info("Translation service initialized successfully")
    
    @lru_cache(maxsize=1000)
    def translate(self, text: str, source_lang: str = "en", target_lang: str = "ml") -> str:
        """
        Translate text from source language to target language.
        
        Args:
            text: Text to translate
            source_lang: Source language code (default: "en")
            target_lang: Target language code (default: "ml")
        
        Returns:
            Translated text, or original text if translation fails
        """
        if not text or not text.strip():
            return text
        
        try:
            # Map language codes to full names for Google Translator
            lang_map = {
                'en': 'english',
                'ml': 'malayalam'
            }
            
            source = lang_map.get(source_lang, source_lang)
            target = lang_map.get(target_lang, target_lang)
            
            # Create translator instance
            translator = GoogleTranslator(source=source, target=target)
            
            # Perform translation
            translated_text = translator.translate(text)
            logger.info(f"Translated text from {source_lang} to {target_lang}")
            
            return translated_text
            
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return text
    
    def translate_batch(self, texts: list, source_lang: str = "en", target_lang: str = "ml") -> list:
        """
        Translate multiple texts at once.
        
        Args:
            texts: List of texts to translate
            source_lang: Source language code (default: "en")
            target_lang: Target language code (default: "ml")
        
        Returns:
            List of translated texts
        """
        return [self.translate(text, source_lang, target_lang) for text in texts]


# Global translation service instance
_translation_service = None


def get_translation_service() -> TranslationService:
    """Get or create the global translation service instance"""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
