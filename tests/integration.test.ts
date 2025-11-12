import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversionToolsClient } from '../src/client';

// Mock all external dependencies
vi.mock('fs');
vi.mock('../src/api/http', () => ({
  HttpClient: class MockHttpClient {
    get = vi.fn();
    post = vi.fn();
    delete = vi.fn();
    constructor() {}
  },
}));

describe('Integration Tests', () => {
  const mockApiToken = 'ct_test_1234567890abcdef1234567890ab';
  let client: ConversionToolsClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ConversionToolsClient({ apiToken: mockApiToken });
  });

  describe('End-to-End Workflow', () => {
    it('should create client with full configuration', () => {
      const configuredClient = new ConversionToolsClient({
        apiToken: mockApiToken,
        baseURL: 'https://api.conversiontools.io/v1',
        timeout: 300000,
        retries: 3,
        pollingInterval: 5000,
        webhookUrl: 'https://example.com/webhook',
      });

      expect(configuredClient).toBeInstanceOf(ConversionToolsClient);
      expect(configuredClient.files).toBeDefined();
      expect(configuredClient.tasks).toBeDefined();
    });

    it('should have access to all API endpoints', () => {
      // These should exist on the client
      expect(client.files).toBeDefined();
      expect(client.tasks).toBeDefined();
      
      // Check that API methods exist
      expect(typeof client.files.upload).toBe('function');
      expect(typeof client.files.downloadTo).toBe('function');
      expect(typeof client.files.downloadBuffer).toBe('function');
      expect(typeof client.files.downloadStream).toBe('function');
      expect(typeof client.files.getInfo).toBe('function');
      
      expect(typeof client.tasks.create).toBe('function');
      expect(typeof client.tasks.getStatus).toBe('function');
      expect(typeof client.tasks.list).toBe('function');
    });

    it('should support progress callbacks in configuration', () => {
      const onUploadProgress = vi.fn();
      const onDownloadProgress = vi.fn();
      const onConversionProgress = vi.fn();

      const clientWithCallbacks = new ConversionToolsClient({
        apiToken: mockApiToken,
        onUploadProgress,
        onDownloadProgress,
        onConversionProgress,
      });

      expect(clientWithCallbacks).toBeInstanceOf(ConversionToolsClient);
    });

    it('should support custom retry configuration', () => {
      const clientWithRetries = new ConversionToolsClient({
        apiToken: mockApiToken,
        retries: 5,
        retryDelay: 2000,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
      });

      expect(clientWithRetries).toBeInstanceOf(ConversionToolsClient);
    });

    it('should support custom polling configuration', () => {
      const clientWithPolling = new ConversionToolsClient({
        apiToken: mockApiToken,
        pollingInterval: 3000,
        maxPollingInterval: 60000,
        pollingBackoff: 2.0,
      });

      expect(clientWithPolling).toBeInstanceOf(ConversionToolsClient);
    });
  });

  describe('Type Safety', () => {
    it('should enforce ConversionToolsClient type', () => {
      expect(client).toBeInstanceOf(ConversionToolsClient);
      
      // These should exist on the client
      expect(client.files).toBeDefined();
      expect(client.tasks).toBeDefined();
    });

    it('should have properly typed API methods', () => {
      // Files API methods
      expect(client.files.upload).toBeInstanceOf(Function);
      expect(client.files.downloadTo).toBeInstanceOf(Function);
      expect(client.files.downloadBuffer).toBeInstanceOf(Function);
      expect(client.files.downloadStream).toBeInstanceOf(Function);
      expect(client.files.getInfo).toBeInstanceOf(Function);

      // Tasks API methods
      expect(client.tasks.create).toBeInstanceOf(Function);
      expect(client.tasks.getStatus).toBeInstanceOf(Function);
      expect(client.tasks.list).toBeInstanceOf(Function);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid configuration gracefully', () => {
      expect(() => new ConversionToolsClient({ apiToken: '' })).toThrow();
      expect(() => new ConversionToolsClient({ apiToken: '   ' })).toThrow();
    });

    it('should accept valid minimal configuration', () => {
      const minimalClient = new ConversionToolsClient({ 
        apiToken: mockApiToken 
      });
      expect(minimalClient).toBeInstanceOf(ConversionToolsClient);
    });

    it('should accept valid full configuration', () => {
      const fullClient = new ConversionToolsClient({
        apiToken: mockApiToken,
        baseURL: 'https://custom.api.url',
        timeout: 60000,
        retries: 3,
        retryDelay: 1000,
        retryableStatuses: [500, 502, 503],
        pollingInterval: 5000,
        maxPollingInterval: 30000,
        pollingBackoff: 1.5,
        webhookUrl: 'https://example.com/webhook',
      });
      expect(fullClient).toBeInstanceOf(ConversionToolsClient);
    });
  });
});
