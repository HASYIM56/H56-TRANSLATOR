'use strict';

const abortController = require('abort-controller');

/**
 * Translate text from one language to another.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language for translation.
 * @returns {Promise<any>} - The response from the translation API.
 */
const translate = async (text, targetLang) => {
    // existing logic here
};

/**
 * Translate text from one language to another with options.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language for translation.
 * @param {Object} options - The options for the translation request.
 * @param {AbortSignal} options.signal - An AbortSignal to cancel the request.
 * @param {number} [options.timeoutMs] - Timeout in milliseconds.
 * @returns {Promise<any>} - The response from the translation API.
 */
const translateV2 = async (text, targetLang, options = {}) => {
    // Validate input
    if (typeof text !== 'string' || typeof targetLang !== 'string') {
        throw new Error('Invalid input types');
    }

    const controller = new AbortController();
    const timeoutId = options.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : null;

    try {
        const response = await fetch('https://h56-translator-api.vercel.app/api/translate/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: options.signal || controller.signal,
            body: JSON.stringify({ text, targetLang }),
        });

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
};

module.exports = { translate, translateV2, supportedLanguages };