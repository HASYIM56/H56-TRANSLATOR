# h56-translator

Translation Service dengan dukungan 100+ bahasa terjemahan — client ringan tanpa dependensi untuk Node.js (server-side).

## Daftar Isi
- [Deskripsi singkat](#deskripsi-singkat)
- [Instalasi](#instalasi)
- [Dukungan runtime](#dukungan-runtime)
- [API publik](#api-publik)
  - [Ekspor](#ekspor)
  - [Tanda tangan fungsi (TypeScript)](#tanda-tangan-fungsi-typescript)
  - [Perilaku dan error handling](#perilaku-dan-error-handling)
- [Contoh penggunaan](#contoh-penggunaan)
- [Kontrak HTTP (request / response)](#kontrak-http-request--response)
- [Penanganan error dan kode status](#penanganan-error-dan-kode-status)
- [Praktik integrasi (timeout, abort, retry)](#praktik-integrasi-timeout-abort-retry)
- [Struktur paket](#struktur-paket)
- [Pengujian & checklist audit](#pengujian--checklist-audit)
- [Keamanan & privasi](#keamanan--privasi)
- [Penerbitan / versi](#penerbitan--versi)
- [Lisensi & penulis](#lisensi--penulis)

---

## Deskripsi singkat
`h56-translator` adalah client ringan untuk layanan terjemahan yang mendukung 100+ bahasa. Dirancang untuk digunakan di lingkungan server-side Node.js tanpa dependensi eksternal.

## Instalasi

NPM:
```bash
npm install h56-translator
```

Catatan: package mengharuskan Node.js >= 18 (Fetch API global tersedia). Jika menggunakan versi Node yang lebih lama, gunakan polyfill Fetch pada runtime.

## Dukungan runtime
- Node.js: >= 18.0.0 (menggunakan global fetch)
- Environment: server-side
- Dependensi: tidak ada (zero-deps)
- Tidak mengharuskan variabel lingkungan untuk operasi dasar

## API publik

### Ekspor
- CommonJS:
```javascript
const { translate } = require('h56-translator')
```
- ESM:
```javascript
import { translate } from 'h56-translator'
```

Fungsi utama:
```ts
translate(text, targetLang, options?)
```

### Tanda tangan fungsi (TypeScript)
```ts
export interface TranslationResult {
  translatedText: string;
  sourceLang: string;    // kode bahasa terdeteksi (ISO-ish, service-defined)
  targetLang: string;    // nilai yang diminta
  serviceStatus: 'ok' | 'error';
  raw?: any;             // seluruh payload respons dari service (opsional)
}

export interface TranslateOptions {
  endpoint?: string;               // default: https://h56-translator-api.vercel.app/api/translate
  signal?: AbortSignal;            // untuk cancelation
  fetch?: typeof globalThis.fetch; // opsional: override fetch untuk testing
  timeoutMs?: number;              // opsional: helper timeout (implementasi internal, non-throwing jika 0/undefined)
}

declare function translate(
  text: string,
  targetLang: string,
  options?: TranslateOptions
): Promise<TranslationResult>;
```

### Perilaku dan error handling
- Fungsi mengembalikan Promise yang resolve dengan `TranslationResult` ketika service merespons dengan status sukses.
- Service melakukan deteksi bahasa sumber otomatis; `sourceLang` disediakan oleh response.
- Jika parameter `text` atau `targetLang` tidak diisi, fungsi melempar (throw) `TypeError` sinkron atau reject Promise dengan pesan error yang jelas.

## Contoh penggunaan

CommonJS (Node.js):
```javascript
const { translate } = require('h56-translator');

(async () => {
  try {
    const result = await translate('Halo dunia', 'en');
    console.log(result.translatedText); // => expected English string
    console.log({ source: result.sourceLang, target: result.targetLang });
  } catch (err) {
    console.error('Translate error:', err);
  }
})();
```

Contoh lain — melihat daftar bahasa yang didukung:
```javascript
const { translate, supportedLanguages } = require("h56-translator");

console.log(supportedLanguages.map(l => `${l.code} — ${l.name}`));

(async () => {
  try {
    const result = await translate("Halo", "id");
    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
})();
```

## Kontrak HTTP (request / response)

Default endpoint: `https://h56-translator-api.vercel.app/api/translate`

Request (POST, JSON):
```json
{
  "text": "Halo dunia",
  "targetLang": "en"
}
```

Respons sukses (200 OK) — contoh sesuai `TranslationResult`:
```json
{
  "translatedText": "Hello world",
  "sourceLang": "id",
  "targetLang": "en",
  "serviceStatus": "ok",
  "raw": { /* seluruh payload dari service jika tersedia */ }
}
```

Contoh respons error terstruktur:
```json
{
  "serviceStatus": "error",
  "error": {
    "code": "unsupported_language",
    "message": "bahasa respon tidak didukung atau tidak ada"
  }
}
```

> Catatan: implementasi server dapat mengembalikan kode status HTTP yang sesuai (4xx/5xx) selain payload JSON di atas.

## Penanganan error dan kode status

Pesan error (perilaku client):
- Jika `text` atau `targetLang` tidak diisi: `text dan targetLang wajib diisi`
- Jika language tidak didukung: `bahasa respon tidak didukung atau tidak ada`
- Jika remote API mengembalikan non-ok: `API error: <status>`

Rekomendasi mapping status:
- 400 Bad Request — parameter tidak lengkap / invalid
- 422 Unprocessable Entity — language tidak didukung
- 502 / 503 — gateway / service error (coba ulang sesuai strategi retry)
- 500 — internal server error

## Praktik integrasi (timeout, abort, retry)

- Gunakan opsi `signal` (AbortSignal) untuk membatalkan request bila diperlukan.
- `timeoutMs` disediakan sebagai helper: bila di-set, client dapat secara internal melakukan abort setelah timeout.
- `fetch` dapat dioverride untuk testing.

Contoh pattern timeout + abort:
```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000); // 5s

try {
  const res = await translate("Halo", "en", { signal: controller.signal });
  // ... gunakan res
} catch (err) {
  if (err.name === "AbortError") {
    // request di-cancel / timeout
  }
  throw err;
} finally {
  clearTimeout(timeout);
}
```

Strategi retry:
- Untuk transient server errors (5xx, 502/503), gunakan retry dengan exponential backoff.
- Batasi jumlah retry (mis. 3 percobaan).
- Pastikan retry hanya untuk idempotent / safe scenarios atau ketika request dapat diulang.

## Struktur paket
Contoh struktur file yang direkomendasikan:
- package.json
- README.md
- index.js (entry point, CommonJS)
- dist/ atau lib/ (jika build/ts -> js)
- types.d.ts (opsional, TypeScript declarations)
- test/ (unit & integration tests)

## Pengujian & checklist audit
Checklist dasar sebelum rilis:
- [ ] Unit tests untuk:
  - valid input -> hasil terjemahan
  - missing `text` / `targetLang` -> throw TypeError
  - override `fetch` untuk response sukses & error
- [ ] Integration test (opsional) terhadap endpoint staging
- [ ] Coverage untuk timeout & abort handling
- [ ] Linting & static types (jika pakai TypeScript)
- [ ] Dokumentasi API & contoh kode di README

## Keamanan & privasi
- Tidak ada dependensi eksternal (zero-deps) — mengurangi permukaan serangan.
- Pastikan tidak mengirim data sensitif ke endpoint publik tanpa persetujuan pengguna.
- Tinjau kebijakan privasi service backend jika menangani data pengguna.
- Gunakan HTTPS untuk komunikasi ke endpoint.

## Penerbitan / versi
- Ikuti SemVer untuk rilis (MAJOR.MINOR.PATCH).
- Menyebutkan persyaratan runtime minimal di setiap rilis (Node >= 18).
- Tandai breaking changes di changelog.

## Lisensi & penulis
- Lisensi: MIT
- Author: HASYIM56

---
