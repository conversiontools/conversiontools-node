/**
 * Base error class for all Conversion Tools API errors
 */
export class ConversionToolsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly response?: any
  ) {
    super(message);
    this.name = 'ConversionToolsError';
    Object.setPrototypeOf(this, ConversionToolsError.prototype);
  }
}

/**
 * Authentication error - Invalid or missing API token
 */
export class AuthenticationError extends ConversionToolsError {
  constructor(message = 'Not authorized - Invalid or missing API token') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Validation error - Invalid request parameters
 */
export class ValidationError extends ConversionToolsError {
  constructor(message: string, response?: any) {
    super(message, 'VALIDATION_ERROR', 400, response);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Rate limit error - Quota exceeded
 */
export class RateLimitError extends ConversionToolsError {
  constructor(
    message: string,
    public readonly limits?: {
      daily?: { limit: number; remaining: number };
      monthly?: { limit: number; remaining: number };
    }
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * File not found error
 */
export class FileNotFoundError extends ConversionToolsError {
  constructor(message = 'File not found', public readonly fileId?: string) {
    super(message, 'FILE_NOT_FOUND', 404);
    this.name = 'FileNotFoundError';
    Object.setPrototypeOf(this, FileNotFoundError.prototype);
  }
}

/**
 * Task not found error
 */
export class TaskNotFoundError extends ConversionToolsError {
  constructor(message = 'Task not found', public readonly taskId?: string) {
    super(message, 'TASK_NOT_FOUND', 404);
    this.name = 'TaskNotFoundError';
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }
}

/**
 * Conversion error - Task failed during conversion
 */
export class ConversionError extends ConversionToolsError {
  constructor(
    message: string,
    public readonly taskId?: string,
    public readonly taskError?: string
  ) {
    super(message, 'CONVERSION_ERROR');
    this.name = 'ConversionError';
    Object.setPrototypeOf(this, ConversionError.prototype);
  }
}

/**
 * Timeout error - Request or operation timed out
 */
export class TimeoutError extends ConversionToolsError {
  constructor(message = 'Operation timed out', public readonly timeout?: number) {
    super(message, 'TIMEOUT_ERROR', 408);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Network error - Connection issues
 */
export class NetworkError extends ConversionToolsError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
