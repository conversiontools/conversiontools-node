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

    it('should pass onDownloadProgress to task.downloadTo via convert()', async () => {
      const onDownloadProgress = vi.fn();
      const client = new ConversionToolsClient({
        apiToken: mockApiToken,
        onDownloadProgress,
      });

      // Stub files.upload
      const uploadSpy = vi.spyOn(client.files, 'upload').mockResolvedValue('a'.repeat(32));

      // Stub tasks.create
      const createSpy = vi.spyOn(client.tasks, 'create').mockResolvedValue({
        error: null,
        task_id: 'b'.repeat(32),
      });

      // Stub tasks.getStatus to return SUCCESS immediately
      vi.spyOn(client.tasks, 'getStatus').mockResolvedValue({
        error: null,
        status: 'SUCCESS',
        file_id: 'c'.repeat(32),
        conversionProgress: 100,
      });

      // Stub files.downloadTo and capture the onProgress argument
      let capturedOnProgress: ((p: any) => void) | undefined;
      vi.spyOn(client.files, 'downloadTo').mockImplementation(
        async (_fileId, _outputPath, onProgress) => {
          capturedOnProgress = onProgress;
          return 'output.csv';
        }
      );

      await client.convert({
        type: 'convert.xml_to_csv',
        input: './test.xml',
        output: 'output.csv',
      });

      expect(capturedOnProgress).toBe(onDownloadProgress);
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
