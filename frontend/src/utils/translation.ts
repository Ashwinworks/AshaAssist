/**
 * Translation utility for dynamic content using deep-translator backend API.
 * Use this for translating blog posts, announcements, user-generated content, etc.
 * 
 * For static UI elements, use the i18next system with hardcoded translations.
 */

import { api } from '../services/api';

// In-memory cache for translated texts
const translationCache = new Map<string, string>();

/**
 * Generate a cache key for a translation
 */
function getCacheKey(text: string, targetLang: string): string {
    return `${targetLang}:${text}`;
}

/**
 * Translate dynamic content using the backend Argos Translate API.
 * 
 * @param text - The text to translate
 * @param targetLang - Target language code ('en' or 'ml')
 * @param sourceLang - Source language code (default: 'en')
 * @returns Translated text or original text if translation fails
 * 
 * @example
 * // Translate blog post content to Malayalam
 * const malayalamText = await translateDynamic(
 *   "Regular health checkups are important.",
 *   "ml"
 * );
 */
export async function translateDynamic(
    text: string,
    targetLang: string,
    sourceLang: string = 'en'
): Promise<string> {
    // Return original if text is empty
    if (!text || !text.trim()) {
        return text;
    }

    // Check cache first
    const cacheKey = getCacheKey(text, targetLang);
    const cached = translationCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const response = await api.post('/api/translate', {
            text,
            source_lang: sourceLang,
            target_lang: targetLang
        });

        const translatedText = response.data.translated_text;

        // Cache the result
        translationCache.set(cacheKey, translatedText);

        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        // Return original text on error
        return text;
    }
}

/**
 * Translate multiple texts at once using batch API.
 * 
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code ('en' or 'ml')
 * @param sourceLang - Source language code (default: 'en')
 * @returns Array of translated texts
 * 
 * @example
 * // Translate multiple blog titles
 * const titles = ["Health Tips", "Vaccination Info", "Nutrition Guide"];
 * const translated = await translateBatch(titles, "ml");
 */
export async function translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang: string = 'en'
): Promise<string[]> {
    try {
        const response = await api.post('/api/translate/batch', {
            texts,
            source_lang: sourceLang,
            target_lang: targetLang
        });

        const translatedTexts = response.data.translated_texts;

        // Cache all results
        texts.forEach((text, index) => {
            const cacheKey = getCacheKey(text, targetLang);
            translationCache.set(cacheKey, translatedTexts[index]);
        });

        return translatedTexts;
    } catch (error) {
        console.error('Batch translation error:', error);
        // Return original texts on error
        return texts;
    }
}

/**
 * Check if the translation service is available.
 * 
 * @returns Promise<boolean> - true if service is initialized and ready
 */
export async function checkTranslationStatus(): Promise<boolean> {
    try {
        const response = await api.get('/api/translate/status');
        return response.data.initialized === true;
    } catch (error) {
        console.error('Translation status check error:', error);
        return false;
    }
}

/**
 * Clear the translation cache.
 * Useful when memory needs to be freed.
 */
export function clearTranslationCache(): void {
    translationCache.clear();
}
