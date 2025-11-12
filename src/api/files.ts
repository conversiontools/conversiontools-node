/**
 * Files API - Upload, download, and manage files
 */

import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import type {
  FileUploadResponse,
  FileInfo,
  FileUploadOptions,
} from '../types/config.js';
import { HttpClient } from './http.js';
import { ValidationError } from '../utils/errors.js';
import { validateFileId } from '../utils/validation.js';
import { trackStreamProgress } from '../utils/progress.js';

export class FilesAPI {
  constructor(private readonly http: HttpClient) {}

  /**
   * Upload a file from various sources
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

    // Create FormData for upload
    const formData = new FormData();

    // Convert Node stream to Web ReadableStream for FormData
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      if (typeof chunk === 'string') {
        chunks.push(new TextEncoder().encode(chunk));
      } else if (chunk instanceof Buffer) {
        chunks.push(new Uint8Array(chunk));
      } else {
        chunks.push(chunk);
      }
    }
    const blob = new Blob(chunks);
    formData.append('file', blob, filename || 'file');

    // Upload file
    const response = await this.http.post<FileUploadResponse>('/files', formData);

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
  async downloadTo(fileId: string, outputPath?: string): Promise<string> {
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

    const nodeStream = Readable.fromWeb(response.body);
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
