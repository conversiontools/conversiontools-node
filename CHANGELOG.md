# Changelog

All notable changes to the `conversiontools` package are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release announcements with extended notes also live at
<https://github.com/conversiontools/conversiontools-node/releases>.

## [Unreleased]

## [2.1.0] - 2026-05-20

### Added
- **Streaming upload.** `FilesAPI.upload()` now sends the file as a chunked
  `multipart/form-data` body and no longer buffers the entire payload in memory.
  Safe for arbitrarily large files; eliminates the OOM cliff previous versions
  hit at ~200 MB.
- `HttpClient.postStream(path, body, contentType, extraHeaders?)` — new public
  method for streaming POSTs. Skips the retry wrapper because a consumed
  `ReadableStream` body cannot be replayed.
- New named exports: `buildMultipartStream`, `sanitizeFilename`.
- Optional `type?: string` field on `TaskStatusResponse` to match the new API
  response shape (api 1.38.5+).

### Fixed
- `client.getTask(id)` no longer hardcodes `task.type = ""`. When the API
  returns `type` (api 1.38.5+), it is populated on the returned `Task`
  instance. Older API deployments still fall back to `""`.

### Changed
- Upload retries: prior versions could retry an upload up to 3 times after
  transient network failures because the body was a fully-buffered `FormData`.
  Streamed uploads cannot be replayed, so a failed upload now surfaces the
  error immediately. Non-upload operations retain the existing retry behaviour
  (3 retries, exponential backoff on 408/500/502/503/504).

### Notes
- 12 new tests cover streaming behaviour: binary byte preservation, chunk
  boundaries, large-input streaming (no buffering), source-stream error
  propagation, sanitized filename, multipart envelope structure.

## [2.0.4] - 2026-03-31

### Changed
- Update dependencies (minimatch, rollup, flatted, picomatch).

## [2.0.3] - 2026-02-21

### Added
- `onProgress` callback in `downloadTo()` — track download progress with
  `loaded`, `total`, `percent` events.
- `onDownloadProgress` config option now wired through `convert()` →
  `task.downloadTo()`.

### Fixed
- SDK version in the `User-Agent` header is now injected at build time from
  `package.json` (previously hardcoded as `2.0.0`).

## [2.0.2] - 2026-02-21

### Added
- Config option to override the User-Agent.

## [2.0.1] - 2025-12-02

### Changed
- Dependency bumps (glob and others).

## [2.0.0] - 2025-11-12

### Added
- Complete rewrite with full TypeScript support (typed methods + options).
- Native ESM + CommonJS dual module support.
- Streaming download via `task.downloadStream()` / `task.downloadTo()`.
- Real-time progress callbacks (upload, conversion, download).
- Smart retry with exponential backoff for transient failures.
- Modern stack: native `fetch`, Node 18+, zero heavy dependencies.
- Webhook support for async task completion notifications.
- Sandbox mode (`sandbox: true`) for testing without consuming quota.
- Typed error classes for specific failure modes.

[Unreleased]: https://github.com/conversiontools/conversiontools-node/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/conversiontools/conversiontools-node/compare/v2.0.4...v2.1.0
[2.0.4]: https://github.com/conversiontools/conversiontools-node/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/conversiontools/conversiontools-node/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/conversiontools/conversiontools-node/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/conversiontools/conversiontools-node/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/conversiontools/conversiontools-node/releases/tag/v2.0.0
