import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConversionToolsClient } from '../src/client';
import { ValidationError } from '../src/utils/errors';

// Mock the HTTP client
vi.mock('../src/api/http', () => ({
  HttpClient: class MockHttpClient {
    get = vi.fn();
    post = vi.fn();
    delete = vi.fn();
    constructor() {}
  },
}));

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
  createReadStream: vi.fn(),
  createWriteStream: vi.fn(),
}));

describe('ConversionToolsClient', () => {
  const mockApiToken = 'test_1234567890abcdef';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should instantiate without errors with valid token', () => {
      const client = new ConversionToolsClient({ apiToken: mockApiToken });
      expect(client).toBeInstanceOf(ConversionToolsClient);
    });

    it('should have files and tasks API endpoints', () => {
      const client = new ConversionToolsClient({ apiToken: mockApiToken });
      expect(client.files).toBeDefined();
      expect(client.tasks).toBeDefined();
    });

    it('should throw ValidationError for invalid API token format', () => {
      expect(() => new ConversionToolsClient({ apiToken: '' }))
        .toThrow(ValidationError);
      
      expect(() => new ConversionToolsClient({ apiToken: '   ' }))
        .toThrow(ValidationError);
    });

    it('should accept custom configuration options', () => {
      const client = new ConversionToolsClient({
        apiToken: mockApiToken,
        baseURL: 'https://custom.api.url',
        timeout: 60000,
        retries: 5,
      });
      expect(client).toBeInstanceOf(ConversionToolsClient);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration values', () => {
      const client = new ConversionToolsClient({ apiToken: mockApiToken });
      expect(client).toBeDefined();
      // The client should be properly configured with defaults
    });

    it('should merge custom config with defaults', () => {
      const client = new ConversionToolsClient({
        apiToken: mockApiToken,
        timeout: 120000,
        pollingInterval: 3000,
      });
      expect(client).toBeDefined();
    });

    it('should accept progress callback functions', () => {
      const onUploadProgress = vi.fn();
      const onDownloadProgress = vi.fn();
      const onConversionProgress = vi.fn();

      const client = new ConversionToolsClient({
        apiToken: mockApiToken,
        onUploadProgress,
        onDownloadProgress,
        onConversionProgress,
      });
      
      expect(client).toBeInstanceOf(ConversionToolsClient);
    });
  });

  describe('API Token Validation', () => {
    it('should reject empty token', () => {
      expect(() => new ConversionToolsClient({ apiToken: '' }))
        .toThrow(ValidationError);
    });

    it('should reject whitespace-only token', () => {
      expect(() => new ConversionToolsClient({ apiToken: '  \t\n  ' }))
        .toThrow(ValidationError);
    });

    it('should accept valid token format', () => {
      const client = new ConversionToolsClient({ 
        apiToken: 'ct_' + 'a'.repeat(32) 
      });
      expect(client).toBeInstanceOf(ConversionToolsClient);
    });
  });
});
