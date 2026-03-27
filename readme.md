# h56-translator

Lightweight translation service supporting 100+ languages. Zero dependencies, server-side Node.js client.

## Contents
- [Overview](#overview)
- [Installation](#installation)
- [Requirements](#requirements)
- [API Reference](#api-reference)
  - [Exports](#exports)
  - [Function Signatures](#function-signatures)
  - [Response Structure](#response-structure)
  - [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
  - [v1 Translation](#v1-translation)
  - [v2 Translation](#v2-translation)
  - [List Supported Languages](#list-supported-languages)
- [HTTP Contract](#http-contract)
  - [v1 Endpoint](#v1-endpoint)
  - [v2 Endpoint](#v2-endpoint)
- [Integration Patterns](#integration-patterns)
  - [Request Cancellation](#request-cancellation)
  - [Retry Strategy](#retry-strategy)
- [Security](#security)
- [License](#license)

---

## Overview

`h56-translator` is a lightweight client for text translation across 100+ languages. Built for server-side Node.js environments with zero external dependencies.

**Two translation modes:**
- **v1**: Standard, professional translations
- **v2**: Informal, conversational translations reflecting natural language usage

---

## Installation

```bash
npm install h56-translator
```

**Node.js Requirement:** >= 18.0.0 (global Fetch API)

---

## Requirements

- Node.js 18.0.0 or higher
- Network connectivity to translation API endpoint
- No external dependencies

---

## API Reference

### Exports

**CommonJS:**
```javascript
const { translate, translateV2, supportedLanguages } = require('h56-translator');
```

**ES Modules:**
```javascript
import { translate, translateV2, supportedLanguages } from 'h56-translator';
```

### Function Signatures

#### v1 - Standard Translation

```typescript
function translate(text: string, targetLang: string): Promise<TranslationResult>
```

**Parameters:**
- `text` (string, required): Content to translate
- `targetLang` (string, required): Target language code (e.g., `'en'`, `'id'`, `'fr'`) or language name (case-insensitive)

**Returns:** Promise resolving to `TranslationResult` object

---

#### v2 - Informal Translation

```typescript
function translateV2(text: string, targetLang: string): Promise<TranslationResult>
```

**Parameters:**
- `text` (string, required): Content to translate
- `targetLang` (string, required): Target language code or language name (case-insensitive)

**Returns:** Promise resolving to `TranslationResult` object

---

### Response Structure

```typescript
interface TranslationResult {
  translatedText: string;    // Translated content
  sourceLang: string;        // Detected source language code
  targetLang: string;        // Requested target language code
  serviceStatus: 'ok' | 'error';  // Operation status
  raw?: any;                 // Complete API response (optional)
}
```

---

### Error Handling

**Thrown Errors:**
- Missing `text` or `targetLang`: `"text dan targetLang wajib diisi"`
- Unsupported language: `"bahasa respon tidak didukung atau tidak ada"`
- Network/API failure: `"API error: {status}"`
- Fetch unavailable: `"fetch is not available in this environment..."`

All errors are synchronous TypeErrors (for validation) or Promise rejections (for API operations).

---

## Usage Examples

### v1 Translation

Standard, formal translation for professional content:

```javascript
const { translate } = require('h56-translator');

(async () => {
  try {
    const result = await translate('Halo dunia', 'en');
    console.log(result.translatedText); // "Hello world"
    console.log(result.sourceLang);     // "id"
    console.log(result.targetLang);     // "en"
  } catch (err) {
    console.error('Translation failed:', err.message);
  }
})();
```

By language name:
```javascript
const result = await translate('Good morning', 'French');
console.log(result.translatedText); // "Bonjour"
```

---

### v2 Translation

Informal, conversational translation:

```javascript
const { translateV2 } = require('h56-translator');

(async () => {
  try {
    const result = await translateV2('Apa kabar?', 'en');
    console.log(result.translatedText); 
    // Possible outputs: "What's up?", "Hey, how you doing?", "Yo, what's up?"
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
```

Slang and cultural expressions:
```javascript
const result = await translateV2('Gokil!', 'en');
console.log(result.translatedText); 
// Possible outputs: "That's insane!", "Wild!", "Crazy stuff!"
```

---

### List Supported Languages

```javascript
const { supportedLanguages } = require('h56-translator');

// View all supported languages
supportedLanguages.forEach(lang => {
  console.log(`${lang.code} - ${lang.name} (${lang.country})`);
});

// Find specific language
const french = supportedLanguages.find(l => l.code === 'fr');
console.log(french); // { code: 'fr', name: 'French', country: 'FR' }

// Search by name
const korean = supportedLanguages.find(l => 
  l.name.toLowerCase() === 'korean'
);
console.log(korean); // { code: 'ko', name: 'Korean', country: 'KR' }
```

---

## HTTP Contract

### v1 Endpoint

**URL:** `https://h56-translator-api.vercel.app/api/translate`

**Method:** POST

**Request:**
```json
{
  "text": "Halo dunia",
  "targetLang": "en"
}
```

**Success Response (200 OK):**
```json
{
  "translatedText": "Hello world",
  "sourceLang": "id",
  "targetLang": "en",
  "serviceStatus": "ok",
  "raw": {}
}
```

**Error Response (4xx/5xx):**
```json
{
  "serviceStatus": "error",
  "error": {
    "code": "unsupported_language",
    "message": "bahasa respon tidak didukung atau tidak ada"
  }
}
```

---

### v2 Endpoint

**URL:** `https://h56-translator-api.vercel.app/api/translate/v2`

**Method:** POST

**Request:**
```json
{
  "text": "Apa kabar?",
  "targetLang": "en"
}
```

**Success Response (200 OK):**
```json
{
  "translatedText": "What's up?",
  "sourceLang": "id",
  "targetLang": "en",
  "serviceStatus": "ok",
  "raw": {}
}
```

---

## Integration Patterns

### Request Cancellation

Abort long-running requests using AbortSignal:

```javascript
const { translate } = require('h56-translator');

const controller = new AbortController();

// Cancel after 10 seconds
setTimeout(() => controller.abort(), 10000);

try {
  const result = await translate('Teks panjang...', 'en');
  console.log(result.translatedText);
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Request cancelled');
  }
}
```

---

### Retry Strategy

Implement exponential backoff for transient failures:

```javascript
const { translateV2 } = require('h56-translator');

async function translateWithRetry(text, targetLang, maxAttempts = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await translateV2(text, targetLang);
    } catch (err) {
      lastError = err;
      
      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

(async () => {
  try {
    const result = await translateWithRetry('Halo', 'en');
    console.log(result.translatedText);
  } catch (err) {
    console.error('Failed after retries:', err.message);
  }
})();
```

---

## Security

- **Zero dependencies:** Minimal attack surface
- **No persistent data:** Tone/style preferences stored only in request scope
- **HTTPS only:** All API communication encrypted
- **Input validation:** Language codes validated against supported list
- **No user tracking:** Translations processed without session tracking

---

## License

MIT © Muhammad Ali Hasyim

---

**Repository:** https://github.com/HASYIM56/h56-translator  
**Issues:** https://github.com/HASYIM56/h56-translator/issues  
**Author:** [HASYIM56](https://github.com/HASYIM56)
