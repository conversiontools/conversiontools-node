/**
 * Task model - High-level interface for conversion tasks
 */

import type {
  TaskStatus,
  TaskStatusResponse,
  WaitOptions,
  ProgressEvent,
} from '../types/config.js';
import { TasksAPI } from '../api/tasks.js';
import { FilesAPI } from '../api/files.js';
import { ConversionError } from '../utils/errors.js';
import { pollTaskStatus } from '../utils/polling.js';

export interface TaskOptions {
  /** Task ID */
  id: string;

  /** Conversion type */
  type: string;

  /** Initial status (optional) */
  status?: TaskStatus;

  /** File ID (result file, if completed) */
  fileId?: string | null;

  /** Error message (if failed) */
  error?: string | null;

  /** Conversion progress (0-100) */
  conversionProgress?: number;

  /** Default polling configuration */
  defaultPolling?: {
    interval: number;
    maxInterval: number;
    backoff: number;
  };
}

export class Task {
  readonly id: string;
  readonly type: string;

  private _status: TaskStatus;
  private _fileId: string | null;
  private _error: string | null;
  private _conversionProgress: number;

  private readonly tasksAPI: TasksAPI;
  private readonly filesAPI: FilesAPI;
  private readonly defaultPolling: {
    interval: number;
    maxInterval: number;
    backoff: number;
  };

  constructor(
    options: TaskOptions,
    tasksAPI: TasksAPI,
    filesAPI: FilesAPI
  ) {
    this.id = options.id;
    this.type = options.type;
    this._status = options.status || 'PENDING';
    this._fileId = options.fileId || null;
    this._error = options.error || null;
    this._conversionProgress = options.conversionProgress || 0;
    this.tasksAPI = tasksAPI;
    this.filesAPI = filesAPI;
    this.defaultPolling = options.defaultPolling || {
      interval: 5000,
      maxInterval: 30000,
      backoff: 1.5,
    };
  }

  /**
   * Get current status
   */
  get status(): TaskStatus {
    return this._status;
  }

  /**
   * Get result file ID
   */
  get fileId(): string | null {
    return this._fileId;
  }

  /**
   * Get error message
   */
  get error(): string | null {
    return this._error;
  }

  /**
   * Get conversion progress (0-100)
   */
  get conversionProgress(): number {
    return this._conversionProgress;
  }

  /**
   * Check if task is complete (success or error)
   */
  get isComplete(): boolean {
    return this._status === 'SUCCESS' || this._status === 'ERROR';
  }

  /**
   * Check if task succeeded
   */
  get isSuccess(): boolean {
    return this._status === 'SUCCESS';
  }

  /**
   * Check if task failed
   */
  get isError(): boolean {
    return this._status === 'ERROR';
  }

  /**
   * Check if task is still running
   */
  get isRunning(): boolean {
    return this._status === 'PENDING' || this._status === 'RUNNING';
  }

  /**
   * Refresh task status from API
   */
  async refresh(): Promise<void> {
    const response = await this.tasksAPI.getStatus(this.id);
    this.updateFromResponse(response);
  }

  /**
   * Get task status (alias for refresh)
   */
  async getStatus(): Promise<TaskStatusResponse> {
    const response = await this.tasksAPI.getStatus(this.id);
    this.updateFromResponse(response);
    return response;
  }

  /**
   * Wait for task to complete
   */
  async wait(options?: WaitOptions): Promise<void> {
    // Use provided options or defaults
    const pollingOptions = {
      interval: options?.pollingInterval || this.defaultPolling.interval,
      maxInterval:
        options?.maxPollingInterval || this.defaultPolling.maxInterval,
      backoff: this.defaultPolling.backoff,
      timeout: options?.timeout,
      onProgress: options?.onProgress,
    };

    // Poll until complete
    const finalStatus = await pollTaskStatus(
      () => this.getStatus(),
      pollingOptions
    );

    // Update internal state
    this.updateFromResponse(finalStatus);

    // Throw error if task failed
    if (this._status === 'ERROR') {
      throw new ConversionError(
        this._error || 'Conversion failed',
        this.id,
        this._error || undefined
      );
    }
  }

  /**
   * Download result file as stream
   */
  async downloadStream(): Promise<NodeJS.ReadableStream> {
    if (!this._fileId) {
      throw new ConversionError(
        'No result file available. Task may not be complete.',
        this.id
      );
    }

    return this.filesAPI.downloadStream(this._fileId);
  }

  /**
   * Download result file as buffer
   */
  async downloadBuffer(): Promise<Buffer> {
    if (!this._fileId) {
      throw new ConversionError(
        'No result file available. Task may not be complete.',
        this.id
      );
    }

    return this.filesAPI.downloadBuffer(this._fileId);
  }

  /**
   * Download result file to path
   */
  async downloadTo(
    outputPath?: string,
    onProgress?: (progress: ProgressEvent) => void
  ): Promise<string> {
    if (!this._fileId) {
      throw new ConversionError(
        'No result file available. Task may not be complete.',
        this.id
      );
    }

    return this.filesAPI.downloadTo(this._fileId, outputPath, onProgress);
  }

  /**
   * Update task state from API response
   */
  private updateFromResponse(response: TaskStatusResponse): void {
    this._status = response.status;
    this._fileId = response.file_id;
    this._error = response.error;
    this._conversionProgress = response.conversionProgress;
  }

  /**
   * Convert to JSON
   */
  toJSON(): {
    id: string;
    type: string;
    status: TaskStatus;
    fileId: string | null;
    error: string | null;
    conversionProgress: number;
    } {
    return {
      id: this.id,
      type: this.type,
      status: this._status,
      fileId: this._fileId,
      error: this._error,
      conversionProgress: this._conversionProgress,
    };
  }
}
