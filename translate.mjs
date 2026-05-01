/**
 * translate.mjs
 *
 * ES Module version for browser and modern Node.js environments.
 * Solves Temporal Dead Zone (TDZ) issues and supports both:
 * - Browser environments (via CDN or bundlers)
 * - Node.js ES Modules (import/export)
 *
 * Translate text to target language using remote API (v1 & v2).
 * - Validates input
 * - Validates that targetLang exists in supported languages list
 * - v1: Standard formal translation
 * - v2: Relaxed, informal translation with natural expressions
 * - Preserves existing v1 logic while extending v2 capabilities
 *
 * Note: This module exports:
 *   export { translate, translateV2, supportedLanguages }
 *
 */

const API_URL = "https://h56-translator-api.vercel.app/api/translate";
const API_URL_V2 = "https://h56-translator-api.vercel.app/api/translate/v2";

/**
 * Supported languages array
 * Contains 100+ languages with code, name, and country information
 * Defined as constant to avoid TDZ issues
 */
const supportedLanguages = [
  { code: "af", name: "Afrikaans", country: "ZA" },
  { code: "sq", name: "Albanian", country: "AL" },
  { code: "am", name: "Amharic", country: "ET" },
  { code: "ar", name: "Arabic", country: "SA" },
  { code: "hy", name: "Armenian", country: "AM" },
  { code: "az", name: "Azerbaijani", country: "AZ" },
  { code: "eu", name: "Basque", country: "ES" },
  { code: "be", name: "Belarusian", country: "BY" },
  { code: "bn", name: "Bengali", country: "BD" },
  { code: "bs", name: "Bosnian", country: "BA" },
  { code: "bg", name: "Bulgarian", country: "BG" },
  { code: "ca", name: "Catalan", country: "ES" },
  { code: "ceb", name: "Cebuano", country: "PH" },
  { code: "ny", name: "Chichewa", country: "MW" },
  { code: "zh", name: "Chinese", country: "CN" },
  { code: "co", name: "Corsican", country: "FR" },
  { code: "hr", name: "Croatian", country: "HR" },
  { code: "cs", name: "Czech", country: "CZ" },
  { code: "da", name: "Danish", country: "DK" },
  { code: "nl", name: "Dutch", country: "NL" },
  { code: "en", name: "English", country: "US" },
  { code: "eo", name: "Esperanto", country: "EU" },
  { code: "et", name: "Estonian", country: "EE" },
  { code: "tl", name: "Filipino/Tagalog", country: "PH" },
  { code: "fi", name: "Finnish", country: "FI" },
  { code: "fr", name: "French", country: "FR" },
  { code: "fy", name: "Frisian", country: "NL" },
  { code: "gl", name: "Galician", country: "ES" },
  { code: "ka", name: "Georgian", country: "GE" },
  { code: "de", name: "German", country: "DE" },
  { code: "el", name: "Greek", country: "GR" },
  { code: "gu", name: "Gujarati", country: "IN" },
  { code: "ht", name: "Haitian Creole", country: "HT" },
  { code: "ha", name: "Hausa", country: "NG" },
  { code: "haw", name: "Hawaiian", country: "US" },
  { code: "iw", name: "Hebrew", country: "IL" },
  { code: "he", name: "Hebrew (alt)", country: "IL" },
  { code: "hi", name: "Hindi", country: "IN" },
  { code: "hmn", name: "Hmong", country: "CN" },
  { code: "hu", name: "Hungarian", country: "HU" },
  { code: "is", name: "Icelandic", country: "IS" },
  { code: "ig", name: "Igbo", country: "NG" },
  { code: "id", name: "Indonesian", country: "ID" },
  { code: "ga", name: "Irish", country: "IE" },
  { code: "it", name: "Italian", country: "IT" },
  { code: "ja", name: "Japanese", country: "JP" },
  { code: "jw", name: "Javanese", country: "ID" },
  { code: "kn", name: "Kannada", country: "IN" },
  { code: "kk", name: "Kazakh", country: "KZ" },
  { code: "km", name: "Khmer", country: "KH" },
  { code: "rw", name: "Kinyarwanda", country: "RW" },
  { code: "ko", name: "Korean", country: "KR" },
  { code: "ku", name: "Kurdish", country: "TR" },
  { code: "ky", name: "Kyrgyz", country: "KG" },
  { code: "lo", name: "Lao", country: "LA" },
  { code: "la", name: "Latin", country: "VA" },
  { code: "lv", name: "Latvian", country: "LV" },
  { code: "lt", name: "Lithuanian", country: "LT" },
  { code: "lb", name: "Luxembourgish", country: "LU" },
  { code: "mk", name: "Macedonian", country: "MK" },
  { code: "mg", name: "Malagasy", country: "MG" },
  { code: "ms", name: "Malay", country: "MY" },
  { code: "ml", name: "Malayalam", country: "IN" },
  { code: "mt", name: "Maltese", country: "MT" },
  { code: "mi", name: "Maori", country: "NZ" },
  { code: "mr", name: "Marathi", country: "IN" },
  { code: "mn", name: "Mongolian", country: "MN" },
  { code: "my", name: "Myanmar (Burmese)", country: "MM" },
  { code: "ne", name: "Nepali", country: "NP" },
  { code: "no", name: "Norwegian", country: "NO" },
  { code: "or", name: "Odia (Oriya)", country: "IN" },
  { code: "ps", name: "Pashto", country: "AF" },
  { code: "fa", name: "Persian", country: "IR" },
  { code: "pl", name: "Polish", country: "PL" },
  { code: "pt", name: "Portuguese", country: "PT" },
  { code: "pa", name: "Punjabi", country: "IN" },
  { code: "ro", name: "Romanian", country: "RO" },
  { code: "ru", name: "Russian", country: "RU" },
  { code: "sm", name: "Samoan", country: "WS" },
  { code: "gd", name: "Scots Gaelic", country: "GB" },
  { code: "sr", name: "Serbian", country: "RS" },
  { code: "st", name: "Sesotho", country: "LS" },
  { code: "sn", name: "Shona", country: "ZW" },
  { code: "sd", name: "Sindhi", country: "PK" },
  { code: "si", name: "Sinhala", country: "LK" },
  { code: "sk", name: "Slovak", country: "SK" },
  { code: "sl", name: "Slovenian", country: "SI" },
  { code: "so", name: "Somali", country: "SO" },
  { code: "es", name: "Spanish", country: "ES" },
  { code: "su", name: "Sundanese", country: "ID" },
  { code: "sw", name: "Swahili", country: "KE" },
  { code: "sv", name: "Swedish", country: "SE" },
  { code: "tg", name: "Tajik", country: "TJ" },
  { code: "ta", name: "Tamil", country: "IN" },
  { code: "tt", name: "Tatar", country: "RU" },
  { code: "te", name: "Telugu", country: "IN" },
  { code: "th", name: "Thai", country: "TH" },
  { code: "tr", name: "Turkish", country: "TR" },
  { code: "tk", name: "Turkmen", country: "TM" },
  { code: "uk", name: "Ukrainian", country: "UA" },
  { code: "ur", name: "Urdu", country: "PK" },
  { code: "ug", name: "Uyghur", country: "CN" },
  { code: "uz", name: "Uzbek", country: "UZ" },
  { code: "vi", name: "Vietnamese", country: "VN" },
  { code: "cy", name: "Welsh", country: "GB" },
  { code: "xh", name: "Xhosa", country: "ZA" },
  { code: "yi", name: "Yiddish", country: "DE" },
  { code: "yo", name: "Yoruba", country: "NG" },
  { code: "zu", name: "Zulu", country: "ZA" },

  // Additional / regional or less-common codes to reach 100+
  { code: "ast", name: "Asturian", country: "ES" },
  { code: "sc", name: "Sardinian", country: "IT" },
  { code: "gael", name: "Scottish Gaelic (alt)", country: "GB" },
  { code: "nso", name: "Northern Sotho", country: "ZA" },
  { code: "rn", name: "Kirundi", country: "BI" },
  { code: "wo", name: "Wolof", country: "SN" },
  { code: "lg", name: "Ganda (Luganda)", country: "UG" },
  { code: "bs-Latn", name: "Bosnian (Latin)", country: "BA" },
  { code: "sr-Cyrl", name: "Serbian (Cyrillic)", country: "RS" },
  { code: "zh-TW", name: "Chinese (Traditional)", country: "TW" },
  { code: "zh-HK", name: "Chinese (Hong Kong)", country: "HK" },
  { code: "en-GB", name: "English (UK)", country: "GB" },
  { code: "en-US", name: "English (US)", country: "US" },
  { code: "pt-BR", name: "Portuguese (Brazil)", country: "BR" },
  { code: "es-MX", name: "Spanish (Mexico)", country: "MX" }
];

/**
 * Detect and return appropriate fetch implementation
 * Works in:
 * - Node.js 18+ (native fetch)
 * - Modern browsers (native fetch)
 * - Older browsers with fetch polyfill
 *
 * @returns {Function|null} fetch function or null if unavailable
 */
function getFetchImplementation() {
  // Check for native fetch (Node 18+ or modern browsers)
  if (typeof fetch !== "undefined") {
    return fetch;
  }

  // Fallback: try to import node-fetch in Node.js environments
  if (typeof globalThis !== "undefined" && globalThis.fetch) {
    return globalThis.fetch;
  }

  return null;
}

/**
 * Validate and normalize language parameter
 * Accepts language code or language name (case-insensitive)
 * Avoids TDZ by using the locally-scoped supportedLanguages constant
 *
 * @param {string} targetLang - Target language code or language name (case-insensitive)
 * @returns {Object} Found language object from supportedLanguages
 * @throws {Error} If language is not found
 */
function validateAndNormalizeLang(targetLang) {
  const normalized = String(targetLang).trim().toLowerCase();

  const found = supportedLanguages.find((l) => {
    return l.code.toLowerCase() === normalized || l.name.toLowerCase() === normalized;
  });

  if (!found) {
    throw new Error("bahasa respon tidak didukung atau tidak ada");
  }

  return found;
}

/**
 * Perform HTTP request to translation API
 * Supports both Node.js and browser environments
 *
 * @param {string} url - API endpoint URL
 * @param {Object} payload - Request payload (text, targetLang)
 * @returns {Promise<Object>} Response JSON from translation API
 * @throws {Error} If fetch is unavailable or API returns non-ok status
 */
async function performTranslationRequest(url, payload) {
  const fetchImpl = getFetchImplementation();

  if (!fetchImpl) {
    throw new Error(
      "fetch is not available in this environment. Please ensure you're using Node.js 18+ or a modern browser, or provide a fetch polyfill."
    );
  }

  const res = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Translate text to target language (v1 - Standard)
 *
 * Performs standard, formal translation suitable for professional content.
 * Automatically detects source language and supports both language codes and names.
 *
 * @param {string} text - Text to translate (required, non-empty string)
 * @param {string} targetLang - Target language code (e.g., 'en', 'id', 'fr') or language name (case-insensitive)
 * @returns {Promise<Object>} Response JSON from translation API with translatedText, sourceLang, targetLang, serviceStatus
 * @throws {Error} If inputs are invalid or API returns non-ok status or language unsupported
 *
 * Error messages:
 * - Missing text or targetLang: "text dan targetLang wajib diisi"
 * - Unsupported language: "bahasa respon tidak didukung atau tidak ada"
 * - Fetch unavailable: "fetch is not available in this environment..."
 * - API error: "API error: {status}"
 *
 * @example
 * // Using language code
 * const result = await translate('Halo dunia', 'en');
 * console.log(result.translatedText); // => "Hello world"
 * console.log(result.sourceLang);     // => "id"
 *
 * @example
 * // Using language name (case-insensitive)
 * const result2 = await translate('Good morning', 'French');
 * console.log(result2.translatedText); // => "Bonjour"
 */
async function translate(text, targetLang) {
  if (!text || !targetLang) {
    throw new Error("text dan targetLang wajib diisi");
  }

  const found = validateAndNormalizeLang(targetLang);

  const payload = {
    text,
    targetLang: found.code,
  };

  return performTranslationRequest(API_URL, payload);
}

/**
 * Translate text to target language (v2 - Informal)
 *
 * Performs informal, conversational translation with natural expressions
 * that reflect everyday language usage and cultural context.
 * Supports slang, colloquialisms, and casual expressions.
 * Uses same language validation as v1 but returns relaxed translations.
 *
 * @param {string} text - Text to translate (required, non-empty string)
 * @param {string} targetLang - Target language code (e.g., 'en', 'id', 'fr') or language name (case-insensitive)
 * @returns {Promise<Object>} Response JSON from v2 API with informal translation
 * @throws {Error} If inputs are invalid or API returns non-ok status or language unsupported
 *
 * Error messages:
 * - Missing text or targetLang: "text dan targetLang wajib diisi"
 * - Unsupported language: "bahasa respon tidak didukung atau tidak ada"
 * - Fetch unavailable: "fetch is not available in this environment..."
 * - API error: "API error: {status}"
 *
 * @example
 * // Casual greeting
 * const result = await translateV2('Apa kabar?', 'en');
 * console.log(result.translatedText); // Possible: "What's up?", "Hey, how you doing?"
 *
 * @example
 * // Slang expression
 * const result2 = await translateV2('Gokil!', 'en');
 * console.log(result2.translatedText); // Possible: "That's insane!", "Wild!", "Crazy stuff!"
 *
 * @example
 * // Using language name (case-insensitive)
 * const result3 = await translateV2('Qué onda?', 'English');
 * console.log(result3.translatedText); // => "What's up?"
 */
async function translateV2(text, targetLang) {
  if (!text || !targetLang) {
    throw new Error("text dan targetLang wajib diisi");
  }

  const found = validateAndNormalizeLang(targetLang);

  const payload = {
    text,
    targetLang: found.code,
  };

  return performTranslationRequest(API_URL_V2, payload);
}

/**
 * Export all public APIs
 *
 * ES Module exports for:
 * - translate: v1 standard translation function
 * - translateV2: v2 informal translation function
 * - supportedLanguages: array of 100+ supported languages
 *
 * Usage in ES Modules:
 * import { translate, translateV2, supportedLanguages } from './translate.mjs';
 *
 * Usage in browsers with CDN:
 * // Import via bundler (webpack, vite, etc.)
 * import { translate, translateV2, supportedLanguages } from 'h56-translator/translate.mjs';
 */
export {
  translate,
  translateV2,
  supportedLanguages,
};

/**
 * Default export for convenience
 * Allows: import translator from './translate.mjs'
 */
export default {
  translate,
  translateV2,
  supportedLanguages,
};
