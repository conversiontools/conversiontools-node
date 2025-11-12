import { describe, it, expect } from 'vitest';
import {
  validateApiToken,
  validateConversionType,
  validateConversionInput,
  validateFileId,
  validateTaskId,
} from '../src/utils/validation';
import { ValidationError } from '../src/utils/errors';

describe('Validation Utilities', () => {
  describe('validateApiToken', () => {
    it('should accept valid API token', () => {
      expect(() => validateApiToken('ct_1234567890abcdef')).not.toThrow();
    });

    it('should reject empty token', () => {
      expect(() => validateApiToken('')).toThrow(ValidationError);
      expect(() => validateApiToken('')).toThrow('API token is required');
    });

    it('should handle whitespace', () => {
      expect(() => validateApiToken('  ')).toThrow(ValidationError);
    });
  });

  describe('validateConversionType', () => {
    it('should accept valid conversion type', () => {
      expect(() => validateConversionType('convert.xml_to_excel')).not.toThrow();
      expect(() => validateConversionType('convert.json_to_csv')).not.toThrow();
    });

    it('should reject empty type', () => {
      expect(() => validateConversionType('')).toThrow(ValidationError);
    });

    it('should reject type without convert. prefix', () => {
      expect(() => validateConversionType('xml_to_excel')).toThrow(ValidationError);
      expect(() => validateConversionType('xml_to_excel')).toThrow('Invalid conversion type format');
    });

    it('should reject non-string types', () => {
      expect(() => validateConversionType(null as any)).toThrow(ValidationError);
      expect(() => validateConversionType(undefined as any)).toThrow(ValidationError);
      expect(() => validateConversionType(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validateConversionInput', () => {
    it('should handle string input as path', () => {
      const result = validateConversionInput('./file.xml');
      expect(result.type).toBe('path');
      expect(result.value).toBe('./file.xml');
    });

    it('should handle explicit path object', () => {
      const result = validateConversionInput({ path: './data.json' });
      expect(result.type).toBe('path');
      expect(result.value).toBe('./data.json');
    });

    it('should handle URL object', () => {
      const result = validateConversionInput({ url: 'https://example.com/file.pdf' });
      expect(result.type).toBe('url');
      expect(result.value).toBe('https://example.com/file.pdf');
    });

    it('should handle fileId object', () => {
      const result = validateConversionInput({ fileId: 'file_12345' });
      expect(result.type).toBe('fileId');
      expect(result.value).toBe('file_12345');
    });

    it('should reject invalid URL', () => {
      expect(() => validateConversionInput({ url: 'not-a-url' })).toThrow(ValidationError);
    });

    it('should reject empty input', () => {
      expect(() => validateConversionInput(null as any)).toThrow(ValidationError);
      expect(() => validateConversionInput(undefined as any)).toThrow(ValidationError);
    });

    it('should reject invalid input object', () => {
      expect(() => validateConversionInput({} as any)).toThrow(ValidationError);
    });
  });

  describe('validateFileId', () => {
    it('should accept valid file ID', () => {
      expect(() => validateFileId('12345678901234567890123456789012')).not.toThrow();
    });

    it('should reject empty file ID', () => {
      expect(() => validateFileId('')).toThrow(ValidationError);
    });

    it('should reject file ID without file_ prefix', () => {
      expect(() => validateFileId('invalid_id')).toThrow(ValidationError);
    });

    it('should reject non-string file ID', () => {
      expect(() => validateFileId(null as any)).toThrow(ValidationError);
      expect(() => validateFileId(123 as any)).toThrow(ValidationError);
    });
  });

  describe('validateTaskId', () => {
    it('should accept valid task ID', () => {
      expect(() => validateTaskId('12345678901234567890123456789012')).not.toThrow();
    });

    it('should reject empty task ID', () => {
      expect(() => validateTaskId('')).toThrow(ValidationError);
    });

    it('should reject task ID without task_ prefix', () => {
      expect(() => validateTaskId('invalid_id')).toThrow(ValidationError);
    });

    it('should reject non-string task ID', () => {
      expect(() => validateTaskId(null as any)).toThrow(ValidationError);
      expect(() => validateTaskId(undefined as any)).toThrow(ValidationError);
    });
  });
});
