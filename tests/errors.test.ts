import { describe, it, expect } from 'vitest';
import {
  ConversionToolsError,
  ValidationError,
  TimeoutError,
  RateLimitError,
  AuthenticationError,
  FileNotFoundError,
  TaskNotFoundError,
  ConversionError,
} from '../src/utils/errors';

describe('Error Classes', () => {
  describe('ConversionToolsError', () => {
    it('should create base error with message', () => {
      const error = new ConversionToolsError('Test error', 'TEST_ERROR');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ConversionToolsError');
      expect(error.code).toBe('TEST_ERROR');
    });

    it('should maintain error stack', () => {
      const error = new ConversionToolsError('Test error', 'TEST_ERROR');
      expect(error.stack).toBeDefined();
    });

    it('should include status code when provided', () => {
      const error = new ConversionToolsError('Test error', 'TEST_ERROR', 500);
      expect(error.status).toBe(500);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error).toBeInstanceOf(ConversionToolsError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should be catchable as ConversionToolsError', () => {
      const error = new ValidationError('Invalid');
      expect(error).toBeInstanceOf(ConversionToolsError);
    });
  });

  describe('FileNotFoundError', () => {
    it('should create file not found error', () => {
      const error = new FileNotFoundError('File not found', 'file_12345');
      expect(error).toBeInstanceOf(ConversionToolsError);
      expect(error.message).toBe('File not found');
      expect(error.fileId).toBe('file_12345');
      expect(error.status).toBe(404);
      expect(error.name).toBe('FileNotFoundError');
    });

    it('should create file not found error without fileId', () => {
      const error = new FileNotFoundError();
      expect(error.fileId).toBeUndefined();
    });
  });

  describe('TaskNotFoundError', () => {
    it('should create task not found error', () => {
      const error = new TaskNotFoundError('Task not found', 'task_12345');
      expect(error).toBeInstanceOf(ConversionToolsError);
      expect(error.message).toBe('Task not found');
      expect(error.taskId).toBe('task_12345');
      expect(error.status).toBe(404);
      expect(error.name).toBe('TaskNotFoundError');
    });
  });

  describe('ConversionError', () => {
    it('should create conversion error', () => {
      const error = new ConversionError('Conversion failed', 'task_12345', 'Invalid format');
      expect(error).toBeInstanceOf(ConversionToolsError);
      expect(error.message).toBe('Conversion failed');
      expect(error.taskId).toBe('task_12345');
      expect(error.taskError).toBe('Invalid format');
      expect(error.name).toBe('ConversionError');
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('Request timed out');
      expect(error).toBeInstanceOf(ConversionToolsError);
      expect(error.message).toBe('Request timed out');
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with limits', () => {
      const error = new RateLimitError('Rate limit exceeded', {
        daily: { limit: 1000, remaining: 0 },
        monthly: { limit: 10000, remaining: 5000 },
      });
      expect(error).toBeInstanceOf(ConversionToolsError);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.limits?.daily?.limit).toBe(1000);
      expect(error.limits?.monthly?.remaining).toBe(5000);
      expect(error.status).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });

    it('should create rate limit error without limits', () => {
      const error = new RateLimitError('Rate limit exceeded');
      expect(error.limits).toBeUndefined();
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Invalid API key');
      expect(error).toBeInstanceOf(ConversionToolsError);
      expect(error.message).toBe('Invalid API key');
      expect(error.status).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should create authentication error with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Not authorized - Invalid or missing API token');
    });
  });

  describe('Error inheritance', () => {
    it('should allow catching specific error types', () => {
      try {
        throw new RateLimitError('Too many requests', {
          daily: { limit: 100, remaining: 0 },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect(error).toBeInstanceOf(ConversionToolsError);
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should allow catching base ConversionToolsError', () => {
      const errors = [
        new ValidationError('Validation failed'),
        new FileNotFoundError('File not found'),
        new TimeoutError('Timeout'),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(ConversionToolsError);
      });
    });
  });
});
