/**
 * Type definitions for Conversion Tools API Client
 */

// Export all conversion types
export * from './conversions.js';

// Export all config types
export * from './config.js';

// Export error types (re-export from utils)
export type {
  ConversionToolsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  FileNotFoundError,
  TaskNotFoundError,
  ConversionError,
  TimeoutError,
  NetworkError,
} from '../utils/errors.js';
