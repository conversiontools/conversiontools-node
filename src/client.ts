/**
 * Main Conversion Tools API Client
 */

import type {
  ConversionToolsConfig,
  ConvertOptions,
  ConversionType,
  RateLimits,
  UserInfo,
} from './types/config.js';
import { HttpClient } from './api/http.js';
import { FilesAPI } from './api/files.js';
import { TasksAPI } from './api/tasks.js';
import { ConfigAPI } from './api/config.js';
import { Task } from './models/Task.js';
import { validateApiToken, validateConversionInput } from './utils/validation.js';

// Package version (will be replaced during build)
const VERSION = '2.0.0';

export class ConversionToolsClient {
  private readonly config: Required<
    Omit<
      ConversionToolsConfig,
      'webhookUrl' | 'onUploadProgress' | 'onDownloadProgress' | 'onConversionProgress'
    >
  > & {
    webhookUrl?: string;
    onUploadProgress?: ConversionToolsConfig['onUploadProgress'];
    onDownloadProgress?: ConversionToolsConfig['onDownloadProgress'];
    onConversionProgress?: ConversionToolsConfig['onConversionProgress'];
  };

  private readonly http: HttpClient;

  /** Files API */
  public readonly files: FilesAPI;

  /** Tasks API */
  public readonly tasks: TasksAPI;

  private readonly configAPI: ConfigAPI;

  constructor(config: ConversionToolsConfig) {
    // Validate API token
    validateApiToken(config.apiToken);

    // Set up configuration with defaults
    this.config = {
      apiToken: config.apiToken,
      baseURL: config.baseURL || 'https://api.conversiontools.io/v1',
      timeout: config.timeout || 300000,
      retries: config.retries !== undefined ? config.retries : 3,
      retryDelay: config.retryDelay || 1000,
      retryableStatuses: config.retryableStatuses || [408, 500, 502, 503, 504],
      pollingInterval: config.pollingInterval || 5000,
      maxPollingInterval: config.maxPollingInterval || 30000,
      pollingBackoff: config.pollingBackoff || 1.5,
      webhookUrl: config.webhookUrl,
      userAgent: config.userAgent || `conversiontools-node/${VERSION}`,
      onUploadProgress: config.onUploadProgress,
      onDownloadProgress: config.onDownloadProgress,
      onConversionProgress: config.onConversionProgress,
    };

    // Initialize HTTP client
    this.http = new HttpClient({
      apiToken: this.config.apiToken,
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
      retryableStatuses: this.config.retryableStatuses,
      userAgent: this.config.userAgent,
    });

    // Initialize API clients
    this.files = new FilesAPI(this.http);
    this.tasks = new TasksAPI(this.http);
    this.configAPI = new ConfigAPI(this.http);
  }

  /**
   * Simple conversion method - upload, convert, wait, and download in one call
   */
  async convert<T extends ConversionType>(
    options: ConvertOptions<T>
  ): Promise<string> {
    const {
      type,
      input,
      output,
      options: conversionOptions,
      wait = true,
      callbackUrl,
      polling,
    } = options;

    // Validate and normalize input
    const inputInfo = validateConversionInput(input);

    let fileId: string | undefined;
    let taskOptions: Record<string, any> = {
      ...conversionOptions,
    };

    // Handle different input types
    if (inputInfo.type === 'fileId') {
      // Already uploaded file
      fileId = inputInfo.value;
      taskOptions.file_id = fileId;
    } else if (inputInfo.type === 'url') {
      // URL-based conversion
      taskOptions.url = inputInfo.value;
    } else {
      // Upload file first
      if (inputInfo.type === 'path') {
        fileId = await this.files.upload(inputInfo.value, {
          onProgress: this.config.onUploadProgress,
        });
      } else if (inputInfo.type === 'stream') {
        fileId = await this.files.upload(inputInfo.value, {
          onProgress: this.config.onUploadProgress,
        });
      } else if (inputInfo.type === 'buffer') {
        fileId = await this.files.upload(inputInfo.value.buffer, {
          onProgress: this.config.onUploadProgress,
        });
      }

      if (fileId) {
        taskOptions.file_id = fileId;
      }
    }

    // Create task
    const task = await this.createTask({
      type: type as string,
      options: taskOptions,
      callbackUrl: callbackUrl || this.config.webhookUrl,
    });

    // If not waiting, return task ID
    if (!wait) {
      return task.id;
    }

    // Wait for completion with progress updates
    await task.wait({
      pollingInterval: polling?.interval || this.config.pollingInterval,
      maxPollingInterval:
        polling?.maxInterval || this.config.maxPollingInterval,
      onProgress: (status) => {
        if (this.config.onConversionProgress) {
          this.config.onConversionProgress({
            loaded: status.conversionProgress,
            total: 100,
            percent: status.conversionProgress,
            status: status.status,
            taskId: task.id,
          });
        }
      },
    });

    // Download result
    const outputPath = await task.downloadTo(output);

    return outputPath;
  }

  /**
   * Create a conversion task (low-level API)
   */
  async createTask(request: {
    type: string;
    options: Record<string, any>;
    callbackUrl?: string;
  }): Promise<Task> {
    const response = await this.tasks.create(request);

    return new Task(
      {
        id: response.task_id,
        type: String(request.type),
        status: 'PENDING',
        defaultPolling: {
          interval: this.config.pollingInterval,
          maxInterval: this.config.maxPollingInterval,
          backoff: this.config.pollingBackoff,
        },
      },
      this.tasks,
      this.files
    );
  }

  /**
   * Get an existing task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const response = await this.tasks.getStatus(taskId);

    return new Task(
      {
        id: taskId,
        type: '', // Type not available from status response
        status: response.status,
        fileId: response.file_id,
        error: response.error,
        conversionProgress: response.conversionProgress,
        defaultPolling: {
          interval: this.config.pollingInterval,
          maxInterval: this.config.maxPollingInterval,
          backoff: this.config.pollingBackoff,
        },
      },
      this.tasks,
      this.files
    );
  }

  /**
   * Get rate limits from last API call
   */
  getRateLimits(): RateLimits | undefined {
    return this.http.getRateLimits();
  }

  /**
   * Get authenticated user information
   */
  async getUser(): Promise<UserInfo> {
    return this.configAPI.getUserInfo();
  }

  /**
   * Get API configuration (available conversion types)
   */
  async getConfig() {
    return this.configAPI.getConfig();
  }
}
