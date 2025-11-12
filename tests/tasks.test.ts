import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TasksAPI } from '../src/api/tasks';
import { HttpClient } from '../src/api/http';
import { ValidationError } from '../src/utils/errors';

// Mock HttpClient
vi.mock('../src/api/http', () => ({
  HttpClient: vi.fn().mockImplementation(() => ({
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('TasksAPI', () => {
  let tasksAPI: TasksAPI;
  let mockHttpClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttpClient = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };
    tasksAPI = new TasksAPI(mockHttpClient as HttpClient);
  });

  describe('create', () => {
    it('should create a conversion task', async () => {
      const mockTask = {
        error: null,
        task_id: '12345678901234567890123456789012',
        status: 'pending',
        type: 'convert.xml_to_excel',
      };

      mockHttpClient.post.mockResolvedValue(mockTask);

      const result = await tasksAPI.create({
        type: 'convert.xml_to_excel',
        options: { file_id: '12345678901234567890123456789012' },
      });
      
      expect(result).toBeDefined();
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/tasks',
        JSON.stringify({
          type: 'convert.xml_to_excel',
          options: { file_id: '12345678901234567890123456789012' },
        })
      );
    });

    it('should create task with webhook URL', async () => {
      mockHttpClient.post.mockResolvedValue({
        error: null,
        task_id: '12345678901234567890123456789012',
        status: 'pending',
      });

      await tasksAPI.create({
        type: 'convert.json_to_csv',
        options: { file_id: '12345678901234567890123456789012' },
        callbackUrl: 'https://example.com/webhook',
      });
      
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/tasks',
        JSON.stringify({
          type: 'convert.json_to_csv',
          options: { file_id: '12345678901234567890123456789012' },
          callbackUrl: 'https://example.com/webhook',
        })
      );
    });

    it('should throw error for invalid conversion type', async () => {
      await expect(tasksAPI.create({
        type: 'invalid_type',
        options: {},
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('getStatus', () => {
    it('should retrieve task status', async () => {
      const mockTask = {
        error: null,
        task_id: '12345678901234567890123456789012',
        status: 'completed' as const,
        type: 'convert.xml_to_excel',
        result_file_id: '12345678901234567890123456789012',
      };

      mockHttpClient.get.mockResolvedValue(mockTask);

      const result = await tasksAPI.getStatus('12345678901234567890123456789012');
      
      expect(result).toBeDefined();
      expect(mockHttpClient.get).toHaveBeenCalledWith('/tasks/12345678901234567890123456789012');
    });

    it('should throw error for invalid task ID', async () => {
      await expect(tasksAPI.getStatus(''))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('list', () => {
    it('should list tasks with default options', async () => {
      const mockResponse = {
        error: null,
        data: [
          { id: '1234567890123456789012345678901a', status: 'completed' as const, type: 'convert.xml_to_excel' },
          { id: '1234567890123456789012345678901b', status: 'processing' as const, type: 'convert.json_to_csv' },
        ],
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await tasksAPI.list();
      
      expect(Array.isArray(result)).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/tasks');
    });

    it('should filter tasks by status SUCCESS', async () => {
      mockHttpClient.get.mockResolvedValue({
        error: null,
        data: [],
      });

      await tasksAPI.list({ status: 'SUCCESS' });
      
      expect(mockHttpClient.get).toHaveBeenCalledWith('/tasks?status=SUCCESS');
    });

    it('should filter tasks by status ERROR', async () => {
      mockHttpClient.get.mockResolvedValue({
        error: null,
        data: [],
      });

      await tasksAPI.list({ status: 'ERROR' });
      
      expect(mockHttpClient.get).toHaveBeenCalledWith('/tasks?status=ERROR');
    });
  });
});
