import type { ConversionType, ConversionOptionsMap } from './conversions.js';

// Re-export ConversionType for external use
export type { ConversionType, ConversionOptionsMap };

/**
 * Configuration for ConversionToolsClient
 */
export interface ConversionToolsConfig {
  /** API token from https://conversiontools.io/profile */
  apiToken: string;

  /** Base URL for API (default: https://api.conversiontools.io/v1) */
  baseURL?: string;

  /** Request timeout in milliseconds (default: 300000 / 5 minutes) */
  timeout?: number;

  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;

  /** Initial delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;

  /** HTTP status codes that should trigger retry (default: [408, 500, 502, 503, 504]) */
  retryableStatuses?: number[];

  /** Polling interval in milliseconds (default: 5000 / 5 seconds) */
  pollingInterval?: number;

  /** Maximum polling interval in milliseconds (default: 30000 / 30 seconds) */
  maxPollingInterval?: number;

  /** Polling backoff multiplier (default: 1.5) */
  pollingBackoff?: number;

  /** Webhook URL for task completion notifications */
  webhookUrl?: string;

  /** UserAgent string for HTTP requests */
  userAgent?: string;

  /** Upload progress callback */
  onUploadProgress?: (progress: ProgressEvent) => void;

  /** Download progress callback */
  onDownloadProgress?: (progress: ProgressEvent) => void;

  /** Conversion progress callback */
  onConversionProgress?: (progress: ConversionProgressEvent) => void;
}

/**
 * Progress event for uploads/downloads
 */
export interface ProgressEvent {
  /** Bytes loaded */
  loaded: number;

  /** Total bytes (if known) */
  total?: number;

  /** Percentage complete (0-100) */
  percent?: number;
}

/**
 * Progress event for conversion tasks
 */
export interface ConversionProgressEvent extends ProgressEvent {
  /** Task status */
  status: TaskStatus;

  /** Task ID */
  taskId: string;
}

/**
 * Input types for conversion
 */
export type ConversionInput =
  | string // File path
  | { path: string } // File path (explicit)
  | { url: string } // URL (for website conversions)
  | { stream: NodeJS.ReadableStream } // Stream
  | { buffer: Buffer; filename?: string } // Buffer
  | { fileId: string }; // Already uploaded file

/**
 * Options for convert() method
 */
export interface ConvertOptions<T extends ConversionType = ConversionType> {
  /** Conversion type (e.g., 'convert.xml_to_excel') */
  type: T;

  /** Input file/URL/stream/buffer */
  input: ConversionInput;

  /** Output file path (optional, defaults to current directory) */
  output?: string;

  /** Conversion-specific options */
  options?: T extends keyof ConversionOptionsMap
    ? ConversionOptionsMap[T]
    : Record<string, any>;

  /** Wait for completion (default: true) */
  wait?: boolean;

  /** Webhook URL for this specific task */
  callbackUrl?: string;

  /** Custom polling configuration */
  polling?: {
    interval?: number;
    maxInterval?: number;
    backoff?: number;
  };
}

/**
 * Task status values
 */
export type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR';

/**
 * Options for task.wait()
 */
export interface WaitOptions {
  /** Polling interval in milliseconds */
  pollingInterval?: number;

  /** Maximum polling interval in milliseconds */
  maxPollingInterval?: number;

  /** Maximum wait time in milliseconds (0 = no limit) */
  timeout?: number;

  /** Progress callback */
  onProgress?: (status: TaskStatusResponse) => void;
}

/**
 * Task status response from API
 */
export interface TaskStatusResponse {
  error: string | null;
  status: TaskStatus;
  file_id: string | null;
  conversionProgress: number;
}

/**
 * Task creation request
 */
export interface TaskCreateRequest {
  type: string;
  options: {
    file_id?: string;
    url?: string;
    sandbox?: boolean;
    [key: string]: any;
  };
  callbackUrl?: string;
}

/**
 * Task creation response
 */
export interface TaskCreateResponse {
  error: string | null;
  task_id: string;
  sandbox?: boolean;
  message?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  error: string | null;
  file_id: string;
}

/**
 * File info response
 */
export interface FileInfo {
  preview: boolean;
  size: number;
  name: string;
  previewData?: string[];
}

/**
 * Rate limits from response headers
 */
export interface RateLimits {
  daily?: {
    limit: number;
    remaining: number;
  };
  monthly?: {
    limit: number;
    remaining: number;
  };
  fileSize?: number;
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  /** Upload progress callback */
  onProgress?: (progress: ProgressEvent) => void;
}

/**
 * User info response
 */
export interface UserInfo {
  error: string | null;
  email: string;
}
