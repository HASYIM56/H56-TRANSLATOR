/**
 * translate.js
 *
 * Translate text to target language using remote API (v1 & v2).
 * - Validates input
 * - Validates that targetLang exists in supported languages list
 * - v1: Standard formal translation
 * - v2: Relaxed, informal translation with natural expressions
 * - Preserves existing v1 logic while extending v2 capabilities
 *
 * Note: This module exports:
 *   module.exports = { translate, translateV2, supportedLanguages }
 *
 */

const API_URL = "https://h56-translator-api.vercel.app/api/translate";
const API_URL_V2 = "https://h56-translator-api.vercel.app/api/translate/v2";
const { supportedLanguages } = require("./listlang/listlang");

// Use global fetch when available (Node 18+ / browsers), otherwise try node-fetch as fallback
let fetchImpl = (typeof fetch !== "undefined") ? fetch : null;
if (!fetchImpl) {
  try {
    // node-fetch v3 is ESM-only; in CommonJS contexts this may fail.
    // Many users run Node >= 18 so global fetch exists. This is a best-effort fallback.
    // If fallback fails, an error will surface when calling translate.
    // eslint-disable-next-line global-require
    fetchImpl = require("node-fetch");
  } catch (err) {
    // leave fetchImpl null; calling code will fail with a clear error if fetch is absent
  }
}

/**
 * Validate and normalize language parameter
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
 * @param {string} url - API endpoint URL
 * @param {Object} payload - Request payload (text, targetLang)
 * @returns {Promise<Object>} Response JSON from translation API
 * @throws {Error} If fetch is unavailable or API returns non-ok status
 */
async function performTranslationRequest(url, payload) {
  if (!fetchImpl) {
    throw new Error(
      "fetch is not available in this environment. Please provide a global fetch or install 'node-fetch'."
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
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code or language name (case-insensitive)
 * @returns {Promise<Object>} Response JSON from translation API with translatedText, sourceLang, targetLang, serviceStatus
 * @throws {Error} If inputs are invalid or API returns non-ok status or language unsupported
 *
 * @example
 * const { translate } = require('h56-translator');
 * const result = await translate('Halo dunia', 'en');
 * console.log(result.translatedText); // => "Hello world"
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
 * v2 delivers relaxed, informal translations with natural expressions
 * that reflect everyday language usage and cultural context in the target language.
 *
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code or language name (case-insensitive)
 * @returns {Promise<Object>} Response JSON from v2 API with translatedText, sourceLang, targetLang, serviceStatus
 * @throws {Error} If inputs are invalid or API returns non-ok status or language unsupported
 *
 * @example
 * const { translateV2 } = require('h56-translator');
 * const result = await translateV2('Apa kabar?', 'en');
 * console.log(result.translatedText); // => "What's up?" or "How you doing?"
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

module.exports = {
  translate,
  translateV2,
  supportedLanguages,
};
