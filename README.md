# Conversion Tools Node.js Client (v2)

[![npm version](https://badge.fury.io/js/conversiontools.svg)](https://www.npmjs.com/package/conversiontools)
[![Node.js Version](https://img.shields.io/node/v/conversiontools.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern TypeScript/JavaScript library for converting files using the [Conversion Tools API](https://conversiontools.io). Convert between 100+ file formats including XML, JSON, Excel, PDF, CSV, images, audio, video, and more.

## ✨ What's New in v2

- 🎯 **Full TypeScript Support** - Complete type definitions with IntelliSense
- 📦 **Dual Module Support** - Works with both ESM and CommonJS
- 🚀 **Streaming Support** - Handle large files efficiently
- 📊 **Progress Tracking** - Monitor upload, conversion, and download progress
- 🔄 **Smart Retry Logic** - Automatic retry with exponential backoff
- 🎨 **Better DX** - Cleaner API with improved error handling
- 🔌 **Webhook Support** - Async notifications for task completion
- 🧪 **Sandbox Mode** - Unlimited testing without consuming quota
- ⚡ **Modern Stack** - Native fetch, Node 18+, zero heavy dependencies

## Installation

```bash
npm install conversiontools
```

Or with Yarn:

```bash
yarn add conversiontools
```

## Quick Start

```javascript
const { ConversionToolsClient } = require('conversiontools');

// Initialize client
const client = new ConversionToolsClient({
  apiToken: 'your-api-token', // Get from https://conversiontools.io/profile
});

// Convert XML to Excel
await client.convert({
  type: 'convert.xml_to_excel',
  input: './data.xml',
  output: './result.xlsx',
});
```

## Features

### 📁 100+ File Format Conversions

Convert between all major file formats:

- **Documents**: XML, JSON, Excel, PDF, CSV, Word, PowerPoint, Markdown
- **Images**: JPG, PNG, WebP, AVIF, HEIC, SVG, TIFF
- **eBooks**: ePUB, MOBI, AZW, AZW3, FB2
- **Audio**: MP3, WAV, FLAC
- **Video**: MP4, MOV, MKV, AVI
- **And more...**

### 🚀 Simple API

```javascript
// One-liner conversions
await client.convert({
  type: 'convert.json_to_excel',
  input: './data.json',
  output: './result.xlsx',
});

// With options
await client.convert({
  type: 'convert.xml_to_csv',
  input: './data.xml',
  output: './result.csv',
  options: {
    delimiter: 'comma',
    quote: true,
  },
});

// URL-based conversions
await client.convert({
  type: 'convert.website_to_pdf',
  input: { url: 'https://example.com' },
  output: './website.pdf',
  options: {
    images: true,
    javascript: true,
  },
});
```

### 📊 Progress Tracking

```javascript
const client = new ConversionToolsClient({
  apiToken: 'your-token',
  onUploadProgress: (progress) => {
    console.log(`Upload: ${progress.percent}%`);
  },
  onConversionProgress: (progress) => {
    console.log(`Converting: ${progress.percent}%`);
  },
  onDownloadProgress: (progress) => {
    console.log(`Download: ${progress.percent}%`);
  },
});

await client.convert({
  type: 'convert.pdf_to_excel',
  input: './large-file.pdf',
  output: './result.xlsx',
});
```

### 🎯 TypeScript Support

Full type safety with IntelliSense:

```typescript
import { ConversionToolsClient, RateLimitError } from 'conversiontools';

const client = new ConversionToolsClient({
  apiToken: 'your-token',
});

// TypeScript knows all valid conversion types and options
await client.convert({
  type: 'convert.xml_to_csv',
  input: './data.xml',
  output: './result.csv',
  options: {
    delimiter: 'comma', // IntelliSense suggests: comma | semicolon | vertical_bar | tabulation
    quote: true,
  },
});
```

### 🔄 Advanced Control

For fine-grained control over the conversion process:

```javascript
// Step 1: Upload file
const fileId = await client.files.upload('./data.xml');

// Step 2: Create task
const task = await client.createTask({
  type: 'convert.xml_to_excel',
  options: {
    file_id: fileId,
  },
});

// Step 3: Wait for completion
await task.wait({
  onProgress: (status) => {
    console.log(`Status: ${status.status}, Progress: ${status.conversionProgress}%`);
  },
});

// Step 4: Download result
await task.downloadTo('./result.xlsx');
```

### 🧪 Sandbox Mode

Test your integration without consuming quota:

```javascript
await client.convert({
  type: 'convert.json_to_excel',
  input: './test-data.json',
  options: {
    sandbox: true, // ✨ Doesn't count against quota
  },
});
```

### 🎨 Error Handling

Type-safe error handling:

```javascript
import {
  RateLimitError,
  ValidationError,
  ConversionError,
  FileNotFoundError,
} from 'conversiontools';

try {
  await client.convert({ /* ... */ });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Quota exceeded:', error.limits);
    console.error('Upgrade at: https://conversiontools.io/api-pricing');
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof ConversionError) {
    console.error('Conversion failed:', error.message);
  } else if (error instanceof FileNotFoundError) {
    console.error('File not found:', error.message);
  }
}
```

## API Reference

### ConversionToolsClient

#### Constructor

```typescript
new ConversionToolsClient(config: ConversionToolsConfig)
```

**Config Options:**
- `apiToken` (string, required) - API token from your profile
- `baseURL` (string, optional) - API base URL (default: https://api.conversiontools.io/v1)
- `timeout` (number, optional) - Request timeout in ms (default: 300000 / 5 min)
- `retries` (number, optional) - Retry attempts (default: 3)
- `retryDelay` (number, optional) - Initial retry delay in ms (default: 1000)
- `pollingInterval` (number, optional) - Status polling interval in ms (default: 5000)
- `maxPollingInterval` (number, optional) - Max polling interval in ms (default: 30000)
- `webhookUrl` (string, optional) - Webhook URL for task notifications
- `onUploadProgress` (function, optional) - Upload progress callback
- `onDownloadProgress` (function, optional) - Download progress callback
- `onConversionProgress` (function, optional) - Conversion progress callback

#### Methods

##### `convert(options)`

Simple conversion method - handles upload, conversion, and download automatically.

```typescript
await client.convert({
  type: 'convert.xml_to_excel',
  input: './data.xml', // or { url: '...' } or { stream: ... }
  output: './result.xlsx',
  options: { /* conversion-specific options */ },
  wait: true, // Wait for completion (default: true)
  callbackUrl: 'https://your-server.com/webhook', // Optional
});
```

##### `createTask(request)`

Create a conversion task manually.

```typescript
const task = await client.createTask({
  type: 'convert.xml_to_excel',
  options: {
    file_id: 'xxx',
  },
});
```

##### `getTask(taskId)`

Get an existing task by ID.

```typescript
const task = await client.getTask('task-id');
```

##### `getRateLimits()`

Get rate limits from last API call.

```typescript
const limits = client.getRateLimits();
// { daily: { limit: 30, remaining: 25 }, monthly: { limit: 300, remaining: 275 } }
```

##### `getUser()`

Get authenticated user information.

```typescript
const user = await client.getUser();
// { email: 'user@example.com' }
```

### Files API

Accessible via `client.files`:

```typescript
// Upload file
const fileId = await client.files.upload('./file.xml');

// Get file info
const info = await client.files.getInfo(fileId);

// Download file
await client.files.downloadTo(fileId, './output.xlsx');
const buffer = await client.files.downloadBuffer(fileId);
const stream = await client.files.downloadStream(fileId);
```

### Tasks API

Accessible via `client.tasks`:

```typescript
// Create task
const response = await client.tasks.create({
  type: 'convert.xml_to_excel',
  options: { file_id: 'xxx' },
});

// Get task status
const status = await client.tasks.getStatus('task-id');

// List tasks
const tasks = await client.tasks.list({ status: 'SUCCESS' });
```

### Task Model

```typescript
// Task properties
task.id // Task ID
task.status // 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR'
task.fileId // Result file ID
task.error // Error message (if failed)
task.conversionProgress // Progress (0-100)

// Task methods
await task.refresh(); // Refresh status
await task.wait(); // Wait for completion
await task.downloadTo('./output.xlsx'); // Download result
const buffer = await task.downloadBuffer(); // Get as buffer
const stream = await task.downloadStream(); // Get as stream
```

## Common Conversion Types

Here are some frequently used conversion types:

### Document Conversions

```javascript
// XML to Excel
await client.convert({
  type: 'convert.xml_to_excel',
  input: './data.xml',
  output: './result.xlsx',
});

// JSON to Excel
await client.convert({
  type: 'convert.json_to_excel',
  input: './data.json',
  output: './result.xlsx',
});

// Excel to CSV
await client.convert({
  type: 'convert.excel_to_csv',
  input: './data.xlsx',
  output: './result.csv',
  options: {
    delimiter: 'comma',
  },
});

// PDF to Text
await client.convert({
  type: 'convert.pdf_to_text',
  input: './document.pdf',
  output: './document.txt',
});

// Word to PDF
await client.convert({
  type: 'convert.word_to_pdf',
  input: './document.docx',
  output: './document.pdf',
});
```

### Image Conversions

```javascript
// PDF to JPG
await client.convert({
  type: 'convert.pdf_to_jpg',
  input: './document.pdf',
  output: './image.jpg',
  options: {
    image_resolution: '300',
    jpeg_quality: 90,
  },
});

// PNG to WebP
await client.convert({
  type: 'convert.png_to_webp',
  input: './image.png',
  output: './image.webp',
  options: {
    webp_quality: 85,
  },
});
```

### Website Conversions

```javascript
// Website to PDF
await client.convert({
  type: 'convert.website_to_pdf',
  input: { url: 'https://example.com' },
  output: './website.pdf',
  options: {
    images: true,
    javascript: true,
    orientation: 'Portrait',
  },
});

// Website to JPG
await client.convert({
  type: 'convert.website_to_jpg',
  input: { url: 'https://example.com' },
  output: './screenshot.jpg',
});
```

### OCR (Text Recognition)

```javascript
// OCR PDF to Text
await client.convert({
  type: 'convert.ocr_pdf_to_text',
  input: './scanned.pdf',
  output: './text.txt',
  options: {
    language_ocr: 'eng', // or 'eng+fra' for multiple languages
  },
});
```

For a complete list of conversion types, see the [API Documentation](https://conversiontools.io/api-documentation).

## Migrating from v1

If you're upgrading from v1, see the [Migration Guide](https://conversiontools.io/api-documentation#upgrade-v1-to-v2).

### Using the Legacy v1 API

For backward compatibility, you can use the v1 API:

```javascript
const ConversionClient = require('conversiontools/legacy');

const client = new ConversionClient('your-api-token');

await client.run('convert.xml_to_csv', {
  filename: 'data.xml',
  outputFilename: 'result.csv',
  timeout: 5000,
  options: { delimiter: 'tabulation' },
});
```

**Note:** The v1 API is deprecated. Please migrate to v2.

## Examples

See the [`examples/`](./examples) directory for more examples:

- [Simple conversion](./examples/simple-conversion.js)
- [With progress tracking](./examples/with-progress.js)
- [Advanced manual control](./examples/advanced-manual-control.js)
- [Sandbox testing](./examples/sandbox-testing.js)
- [URL-based conversions](./examples/url-conversion.js)
- [TypeScript usage](./examples/typescript-example.ts)

## Requirements

- Node.js 18 or higher
- API token from [Conversion Tools](https://conversiontools.io/profile)

## License

[MIT](./LICENSE)

## Support

- 📚 [API Documentation](https://conversiontools.io/api-documentation)
- 🐛 [Report Issues](https://github.com/conversiontools/conversiontools-node/issues)
- 💬 [Contact Support](https://conversiontools.io/contact)
- 🌐 [Website](https://conversiontools.io)

---

**Made with ❤️ by [Conversion Tools](https://conversiontools.io)**
