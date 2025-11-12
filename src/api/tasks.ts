/**
 * Tasks API - Create and manage conversion tasks
 */

import type {
  TaskCreateRequest,
  TaskCreateResponse,
  TaskStatusResponse,
  TaskStatus,
} from '../types/config.js';
import { HttpClient } from './http.js';
import { validateTaskId, validateConversionType } from '../utils/validation.js';

export interface TaskListOptions {
  status?: TaskStatus;
}

export interface TaskDetail {
  id: string;
  type: string;
  status: TaskStatus;
  error: string | null;
  url: string | null;
  dateCreated: string;
  dateFinished: string | null;
  conversionProgress: number;
  fileSource?: {
    id: string;
    name: string;
    size: number;
    exists: boolean;
  };
  fileResult?: {
    id: string;
    name: string;
    size: number;
    exists: boolean;
  };
}

export class TasksAPI {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new conversion task
   */
  async create(request: TaskCreateRequest): Promise<TaskCreateResponse> {
    validateConversionType(request.type);

    const response = await this.http.post<TaskCreateResponse>(
      '/tasks',
      JSON.stringify(request)
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response;
  }

  /**
   * Get task status
   */
  async getStatus(taskId: string): Promise<TaskStatusResponse> {
    validateTaskId(taskId);

    const response = await this.http.get<TaskStatusResponse>(
      `/tasks/${encodeURIComponent(taskId)}`
    );

    return response;
  }

  /**
   * List all tasks (optionally filtered by status)
   */
  async list(options?: TaskListOptions): Promise<TaskDetail[]> {
    let path = '/tasks';

    if (options?.status) {
      path += `?status=${encodeURIComponent(options.status)}`;
    }

    const response = await this.http.get<{ error: string | null; data: TaskDetail[] }>(
      path
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data;
  }
}
