# Changelog

## [Unreleased] - 2026-06-23

### Security
- Fix cookie injection vulnerability: URL-encode cookie values, add `Secure` flag, validate with Zod schema on server-side read
- Add IP-based rate limiting to AI search endpoint (10 req/IP/min + 60 global/min)
- Use unspoofable IP headers (`x-vercel-forwarded-for`, `cf-connecting-ip`) for rate limiting
- Sanitize AI search queries: strip control characters, cap at 500 characters
- Validate LLM-returned surah/verse numbers against actual Quran structure to prevent fabricated references
- Remove third-party Umami analytics script

### Fixed
- Fix AI search failing on cold starts by replacing 342-call Quran preload with per-verse `getAyah()` calls (max 21 parallel)
- Fix hardcoded "High Traffic or Rate limit exceeded" error message — now shows actual error for each failure mode
- Fix `navigator.share` feature detection (use `typeof` check instead of truthiness)
- Fix TypeScript closure narrowing error in verse-metadata scroll handler
- Fix `repeatCount` possibly-undefined error in audio-player-drawer
- Fix all `react/no-unescaped-entities` ESLint errors across 6 components

### Changed
- Replace manual DOM toast notifications with sonner library in verse-item, bookmark-surah-button, and share-surah-button
- Re-enable TypeScript type checking and ESLint during builds (previously disabled with `ignoreDuringBuilds` / `ignoreBuildErrors`)

### Added
- ESLint configuration (`.eslintrc.json`) with `next/core-web-vitals` preset
- `eslint@8` and `eslint-config-next@14` as dev dependencies
- `sonner` toast library and `<Toaster />` in root layout
- `zod` for server-side cookie validation
