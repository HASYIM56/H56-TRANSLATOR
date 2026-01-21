/**
 * translate.js
 *
 * Translate text to target language using remote API.
 * - Validates input
 * - Validates that targetLang exists in supported languages list
 * - Preserves existing logic (POST to API_URL and return res.json())
 *
 * Note: This module exports:
 *   module.exports = { translate, supportedLanguages }
 *
 */

const API_URL = "https://h56-translator-api.vercel.app/api/translate";
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
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code or language name (case-insensitive)
 * @returns {Promise<Object>} Response JSON from translation API
 * @throws {Error} If inputs are invalid or API returns non-ok status or language unsupported
 */
async function translate(text, targetLang) {
  if (!text || !targetLang) {
    throw new Error("text dan targetLang wajib diisi");
  }

  // Normalize incoming targetLang to allow either code or language name (case-insensitive)
  const normalized = String(targetLang).trim().toLowerCase();

  // Try to find the language by code or by name
  const found = supportedLanguages.find((l) => {
    return l.code.toLowerCase() === normalized || l.name.toLowerCase() === normalized;
  });

  if (!found) {
    // Bahasa tidak didukung
    throw new Error("bahasa respon tidak didukung atau tidak ada");
  }

  if (!fetchImpl) {
    throw new Error("fetch is not available in this environment. Please provide a global fetch or install 'node-fetch'.");
  }

  const res = await fetchImpl(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, targetLang: found.code }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

module.exports = {
  translate,
  supportedLanguages,
};