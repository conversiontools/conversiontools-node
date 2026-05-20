/**
 * Files API - Upload, download, and manage files
 */

import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import type {
  FileUploadResponse,
  FileInfo,
  FileUploadOptions,
  ProgressEvent,
} from '../types/config.js';
import { HttpClient } from './http.js';
import { ValidationError } from '../utils/errors.js';
import { validateFileId } from '../utils/validation.js';
import { trackStreamProgress } from '../utils/progress.js';

export class FilesAPI {
  constructor(private readonly http: HttpClient) {}

  /**
   * Upload a file from various sources.
   *
   * Streams the upload chunked to the API — never buffers the entire file
   * in memory. Safe for arbitrarily large inputs.
   */
  async upload(
    input: string | NodeJS.ReadableStream | Buffer,
    options?: FileUploadOptions
  ): Promise<string> {
    let stream: NodeJS.ReadableStream;
    let filename: string | undefined;
    let fileSize: number | undefined;

    // Handle different input types
    if (typeof input === 'string') {
      // File path
      if (!fs.existsSync(input)) {
        throw new ValidationError(`File not found: ${input}`);
      }
      const stats = fs.statSync(input);
      if (!stats.isFile()) {
        throw new ValidationError(`Not a file: ${input}`);
      }
      stream = fs.createReadStream(input);
      filename = path.basename(input);
      fileSize = stats.size;
    } else if (Buffer.isBuffer(input)) {
      // Buffer
      stream = Readable.from(input);
      fileSize = input.length;
    } else {
      // Stream
      stream = input;
    }

    // Track progress if callback provided
    if (options?.onProgress) {
      stream = trackStreamProgress(stream, options.onProgress, fileSize);
    }

    // Build a streaming multipart/form-data body — chunk by chunk, no buffer
    const boundary = `----conversiontools-${randomUUID()}`;
    const head = Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${sanitizeFilename(filename || 'file')}"\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`,
      'utf8'
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

    const body = buildMultipartStream(head, stream, tail);

    const response = await this.http.postStream<FileUploadResponse>(
      '/files',
      body,
      `multipart/form-data; boundary=${boundary}`
    );

    if (response.error) {
      throw new ValidationError(response.error);
    }

    return response.file_id;
  }

  /**
   * Get file metadata
   */
  async getInfo(fileId: string): Promise<FileInfo> {
    validateFileId(fileId);
    return this.http.get<FileInfo>(`/files/${encodeURIComponent(fileId)}/info`);
  }

  /**
   * Download file as stream
   */
  async downloadStream(fileId: string): Promise<NodeJS.ReadableStream> {
    validateFileId(fileId);

    const response = await this.http.get<Response>(`/files/${encodeURIComponent(fileId)}`, {
      raw: true,
    });

    if (!response.body) {
      throw new ValidationError('No response body');
    }

    // Convert Web ReadableStream to Node.js ReadableStream
    return Readable.fromWeb(response.body);
  }

  /**
   * Download file as buffer
   */
  async downloadBuffer(fileId: string): Promise<Buffer> {
    validateFileId(fileId);

    const response = await this.http.get<Response>(`/files/${encodeURIComponent(fileId)}`, {
      raw: true,
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Download file to path
   */
  async downloadTo(
    fileId: string,
    outputPath?: string,
    onProgress?: (progress: ProgressEvent) => void
  ): Promise<string> {
    validateFileId(fileId);

    const response = await this.http.get<Response>(`/files/${encodeURIComponent(fileId)}`, {
      raw: true,
    });

    // Determine output filename
    let filename = outputPath;
    if (!filename) {
      // Try to get filename from Content-Disposition header
      const disposition = response.headers.get('content-disposition');
      if (disposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          disposition
        );
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      filename = filename || 'result';
    }

    // Ensure directory exists
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Stream response to file
    if (!response.body) {
      throw new ValidationError('No response body');
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : undefined;

    let nodeStream: NodeJS.ReadableStream = Readable.fromWeb(response.body);
    if (onProgress) {
      nodeStream = trackStreamProgress(nodeStream, onProgress, total);
    }

    const writeStream = fs.createWriteStream(filename);

    await new Promise<void>((resolve, reject) => {
      nodeStream.pipe(writeStream);
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
      nodeStream.on('error', reject);
    });

    return filename;
  }
}

/**
 * Wrap a Node.js Readable stream as a Web ReadableStream that prepends
 * `head` bytes and appends `tail` bytes — used to build streaming
 * multipart bodies without buffering the source.
 */
export function buildMultipartStream(
  head: Buffer,
  source: NodeJS.ReadableStream,
  tail: Buffer
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(head));
      source.on('data', (chunk: Buffer | string) => {
        const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        controller.enqueue(new Uint8Array(buf));
      });
      source.on('end', () => {
        controller.enqueue(new Uint8Array(tail));
        controller.close();
      });
      source.on('error', (err) => {
        controller.error(err);
      });
    },
    cancel() {
      (source as Readable).destroy?.();
    },
  });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[\r\n"\\]/g, '_');
}
