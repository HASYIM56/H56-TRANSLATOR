/**
 * index.d.ts
 *
 * TypeScript type definitions for h56-translator
 * Provides complete type safety for all exported functions and interfaces
 */

/**
 * Language entry in supported languages list
 */
export interface Language {
  /** ISO 639-1 language code (e.g., 'en', 'id', 'fr') or regional variant (e.g., 'zh-TW', 'pt-BR') */
  code: string;
  /** English name of the language */
  name: string;
  /** ISO 3166-1 alpha-2 country code */
  country: string;
}

/**
 * Translation result returned by translate functions
 */
export interface TranslationResult {
  /** The translated text in target language */
  translatedText: string;
  /** Detected source language code */
  sourceLang: string;
  /** Requested target language code */
  targetLang: string;
  /** Operation status indicator */
  serviceStatus: 'ok' | 'error';
  /** Complete raw API response (optional, implementation-dependent) */
  raw?: any;
}

/**
 * Supported languages array
 * Contains 100+ languages with code, name, and country information
 *
 * @example
 * import { supportedLanguages } from 'h56-translator';
 * const french = supportedLanguages.find(l => l.code === 'fr');
 */
export declare const supportedLanguages: Language[];

/**
 * Translate text to target language (v1 - Standard)
 *
 * Performs standard, formal translation suitable for professional content.
 * Automatically detects source language and supports both language codes and names.
 *
 * @param text - Text to translate (required, non-empty string)
 * @param targetLang - Target language code (e.g., 'en', 'id', 'fr') or language name (case-insensitive)
 * @returns Promise resolving to TranslationResult with translated content
 * @throws {Error} If text or targetLang is missing: "text dan targetLang wajib diisi"
 * @throws {Error} If language not supported: "bahasa respon tidak didukung atau tidak ada"
 * @throws {Error} If fetch unavailable: "fetch is not available in this environment..."
 * @throws {Error} If API returns error: "API error: {status}"
 *
 * @example
 * import { translate } from 'h56-translator';
 *
 * // Using language code
 * const result = await translate('Halo dunia', 'en');
 * console.log(result.translatedText); // "Hello world"
 * console.log(result.sourceLang);     // "id"
 *
 * // Using language name (case-insensitive)
 * const result2 = await translate('Good morning', 'French');
 * console.log(result2.translatedText); // "Bonjour"
 */
export declare function translate(text: string, targetLang: string): Promise<TranslationResult>;

/**
 * Translate text to target language (v2 - Informal)
 *
 * Performs informal, conversational translation with natural expressions
 * that reflect everyday language usage and cultural context.
 * Supports slang, colloquialisms, and casual expressions.
 * Uses same language validation as v1 but returns relaxed translations.
 *
 * @param text - Text to translate (required, non-empty string)
 * @param targetLang - Target language code (e.g., 'en', 'id', 'fr') or language name (case-insensitive)
 * @returns Promise resolving to TranslationResult with informal translation
 * @throws {Error} If text or targetLang is missing: "text dan targetLang wajib diisi"
 * @throws {Error} If language not supported: "bahasa respon tidak didukung atau tidak ada"
 * @throws {Error} If fetch unavailable: "fetch is not available in this environment..."
 * @throws {Error} If API returns error: "API error: {status}"
 *
 * @example
 * import { translateV2 } from 'h56-translator';
 *
 * // Casual greeting
 * const result = await translateV2('Apa kabar?', 'en');
 * console.log(result.translatedText); // Possible: "What's up?", "Hey, how you doing?"
 *
 * // Slang expression
 * const result2 = await translateV2('Gokil!', 'en');
 * console.log(result2.translatedText); // Possible: "That's insane!", "Wild!", "Crazy stuff!"
 *
 * // Using language name
 * const result3 = await translateV2('Qué onda?', 'English');
 * console.log(result3.translatedText); // "What's up?"
 */
export declare function translateV2(text: string, targetLang: string): Promise<TranslationResult>;