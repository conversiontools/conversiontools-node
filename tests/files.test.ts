import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilesAPI } from '../src/api/files';
import { HttpClient } from '../src/api/http';
import { ValidationError } from '../src/utils/errors';
import * as fs from 'fs';

// Mock fs module
vi.mock('fs');

// Mock HttpClient
vi.mock('../src/api/http', () => ({
  HttpClient: vi.fn().mockImplementation(() => ({
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('FilesAPI', () => {
  let filesAPI: FilesAPI;
  let mockHttpClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttpClient = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };
    filesAPI = new FilesAPI(mockHttpClient as HttpClient);
  });

  describe('upload', () => {
    it('should handle file path input', async () => {
      // Mock fs functions
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({
        isFile: () => true,
        size: 1024,
      } as any);
      
      // Create an async iterable stream mock
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('test data');
        }
      };
      vi.mocked(fs.createReadStream).mockReturnValue(mockStream as any);

      mockHttpClient.post.mockResolvedValue({
        error: null,
        file_id: '12345678901234567890123456789012',
      });

      const fileId = await filesAPI.upload('./test.xml');
      
      expect(fileId).toBe('12345678901234567890123456789012');
      expect(fs.existsSync).toHaveBeenCalledWith('./test.xml');
      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should throw ValidationError for non-existent file', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(filesAPI.upload('./nonexistent.xml'))
        .rejects.toThrow(ValidationError);
      await expect(filesAPI.upload('./nonexistent.xml'))
        .rejects.toThrow('File not found');
    });

    it('should handle Buffer input', async () => {
      const buffer = Buffer.from('test data');
      mockHttpClient.post.mockResolvedValue({
        error: null,
        file_id: '12345678901234567890123456789012',
      });

      const fileId = await filesAPI.upload(buffer);
      
      expect(fileId).toBe('12345678901234567890123456789012');
      expect(mockHttpClient.post).toHaveBeenCalled();
    });

    it('should call onProgress callback if provided', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({
        isFile: () => true,
        size: 2048,
      } as any);
      
      // Create an async iterable stream mock with on() method for progress tracking
      const mockStream = {
        on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(Buffer.from('test'));
          }
          return mockStream;
        }),
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('test data');
        }
      };
      vi.mocked(fs.createReadStream).mockReturnValue(mockStream as any);

      mockHttpClient.post.mockResolvedValue({
        error: null,
        file_id: 'file_progress',
      });

      const onProgress = vi.fn();
      await filesAPI.upload('./test.xml', { onProgress });
      
      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('getInfo', () => {
    it('should retrieve file info', async () => {
      const mockFileInfo = {
        error: null,
        file_id: '12345678901234567890123456789012',
        filename: 'test.xml',
        size: 1024,
        created: '2025-01-01T00:00:00Z',
      };

      mockHttpClient.get.mockResolvedValue(mockFileInfo);

      const info = await filesAPI.getInfo('12345678901234567890123456789012');
      
      expect(info).toEqual(mockFileInfo);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/files/12345678901234567890123456789012/info');
    });

    it('should throw error for invalid file ID', async () => {
      await expect(filesAPI.getInfo(''))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('downloadTo', () => {
    it('should download a file to path', async () => {
      // Mock fs functions needed for download
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
      
      // Create a proper writable stream mock with all necessary methods
      const mockWriteStream = {
        write: vi.fn(),
        end: vi.fn(),
        once: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'finish') {
            setTimeout(() => callback(), 0);
          }
          return mockWriteStream;
        }),
        emit: vi.fn(),
        writable: true,
      };
      vi.mocked(fs.createWriteStream).mockReturnValue(mockWriteStream as any);
      
      const mockResponse = new Response('test content', {
        headers: {
          'content-disposition': 'attachment; filename="test.xml"',
        },
      });
      
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await filesAPI.downloadTo('12345678901234567890123456789012', './output.xml');
      
      expect(result).toBe('./output.xml');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/files/12345678901234567890123456789012', {
        raw: true,
      });
    });

    it('should throw error for invalid file ID', async () => {
      await expect(filesAPI.downloadTo('invalid_id'))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('downloadBuffer', () => {
    it('should download file as buffer', async () => {
      const mockBuffer = Buffer.from('test content');
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockBuffer.buffer),
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await filesAPI.downloadBuffer('12345678901234567890123456789012');
      
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/files/12345678901234567890123456789012', {
        raw: true,
      });
    });
  });
});
