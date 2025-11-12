/**
 * Input validation utilities
 */

import { ValidationError } from './errors.js';
import type { ConversionInput } from '../types/config.js';

/**
 * Validate conversion type format
 */
export function validateConversionType(type: string): void {
  if (!type || typeof type !== 'string') {
    throw new ValidationError('Conversion type is required and must be a string');
  }

  // Check if it follows the pattern convert.source_to_target
  if (!type.startsWith('convert.')) {
    throw new ValidationError(
      `Invalid conversion type format: "${type}". Expected format: "convert.source_to_target"`
    );
  }
}

/**
 * Validate and normalize conversion input
 */
export function validateConversionInput(input: ConversionInput): {
  type: 'path' | 'url' | 'stream' | 'buffer' | 'fileId';
  value: any;
} {
  if (!input) {
    throw new ValidationError('Input is required');
  }

  // String input = file path
  if (typeof input === 'string') {
    return { type: 'path', value: input };
  }

  // Object input
  if (typeof input === 'object' && input !== null) {
    // Explicit path
    if ('path' in input && typeof input.path === 'string') {
      return { type: 'path', value: input.path };
    }

    // URL
    if ('url' in input && typeof input.url === 'string') {
      if (!isValidUrl(input.url)) {
        throw new ValidationError(`Invalid URL: ${input.url}`);
      }
      return { type: 'url', value: input.url };
    }

    // Stream
    if ('stream' in input && input.stream) {
      return { type: 'stream', value: input.stream };
    }

    // Buffer
    if ('buffer' in input && Buffer.isBuffer(input.buffer)) {
      return { type: 'buffer', value: input };
    }

    // File ID
    if ('fileId' in input && typeof input.fileId === 'string') {
      return { type: 'fileId', value: input.fileId };
    }
  }

  throw new ValidationError(
    'Invalid input format. Expected: string, { path }, { url }, { stream }, { buffer }, or { fileId }'
  );
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate API token
 */
export function validateApiToken(token: string): void {
  if (!token || typeof token !== 'string') {
    throw new ValidationError('API token is required and must be a string');
  }

  if (token.trim().length === 0) {
    throw new ValidationError('API token cannot be empty');
  }
}

/**
 * Validate file ID format
 */
export function validateFileId(fileId: string): void {
  if (!fileId || typeof fileId !== 'string') {
    throw new ValidationError('File ID is required and must be a string');
  }

  // File IDs are typically 32-character hex strings
  if (!/^[a-f0-9]{32}$/i.test(fileId)) {
    throw new ValidationError(
      `Invalid file ID format: "${fileId}". Expected 32-character hexadecimal string`
    );
  }
}

/**
 * Validate task ID format
 */
export function validateTaskId(taskId: string): void {
  if (!taskId || typeof taskId !== 'string') {
    throw new ValidationError('Task ID is required and must be a string');
  }

  // Task IDs are typically 32-character hex strings
  if (!/^[a-f0-9]{32}$/i.test(taskId)) {
    throw new ValidationError(
      `Invalid task ID format: "${taskId}". Expected 32-character hexadecimal string`
    );
  }
}
