/**
 * HTTP client with retry logic for Conversion Tools API
 */

import type { RateLimits } from '../types/config.js';
import {
  ConversionToolsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  FileNotFoundError,
  TaskNotFoundError,
  NetworkError,
  TimeoutError,
} from '../utils/errors.js';
import { withRetry } from '../utils/retry.js';

const DEFAULT_BASE_URL = 'https://api.conversiontools.io/v1';
const DEFAULT_TIMEOUT = 300000; // 5 minutes
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_RETRYABLE_STATUSES = [408, 500, 502, 503, 504];

export interface HttpClientConfig {
  apiToken: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
  userAgent?: string;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  raw?: boolean; // Return raw response without JSON parsing
  signal?: AbortSignal;
}

export class HttpClient {
  private readonly config: Required<Omit<HttpClientConfig, 'userAgent'>> & {
    userAgent?: string;
  };
  private lastRateLimits?: RateLimits;

  constructor(config: HttpClientConfig) {
    this.config = {
      apiToken: config.apiToken,
      baseURL: config.baseURL || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      retries: config.retries || DEFAULT_RETRIES,
      retryDelay: config.retryDelay || DEFAULT_RETRY_DELAY,
      retryableStatuses:
        config.retryableStatuses || DEFAULT_RETRYABLE_STATUSES,
      userAgent: config.userAgent,
    };
  }

  /**
   * Get the last rate limits from API response headers
   */
  getRateLimits(): RateLimits | undefined {
    return this.lastRateLimits;
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T = any>(options: RequestOptions): Promise<T> {
    const { method, path, body, headers, raw, signal } = options;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    // If external signal provided, listen to it
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      return await withRetry(
        async () => {
          const url = `${this.config.baseURL}${path}`;

          // Prepare headers
          const requestHeaders: Record<string, string> = {
            Authorization: `Bearer ${this.config.apiToken}`,
            ...headers,
          };

          // Add user agent if provided
          if (this.config.userAgent) {
            requestHeaders['User-Agent'] = this.config.userAgent;
          }

          // Add content-type for JSON bodies
          if (body && typeof body === 'string') {
            requestHeaders['Content-Type'] = 'application/json';
          }

          // Make request
          let response: Response;
          try {
            response = await fetch(url, {
              method,
              headers: requestHeaders,
              body: body instanceof FormData || typeof body === 'string' ? body : undefined,
              signal: controller.signal,
            });
          } catch (error: any) {
            // Handle network errors
            if (error.name === 'AbortError') {
              throw new TimeoutError(
                `Request timed out after ${this.config.timeout}ms`,
                this.config.timeout
              );
            }
            throw new NetworkError(
              `Network request failed: ${error.message}`,
              error
            );
          }

          // Extract rate limits from headers
          this.extractRateLimits(response.headers);

          // Handle error responses
          if (!response.ok) {
            await this.handleErrorResponse(response);
          }

          // Return raw response if requested
          if (raw) {
            return response as any;
          }

          // Parse JSON response
          const data = await response.json();

          // Check for error in response body
          if ((data as any).error) {
            throw new ConversionToolsError(
              (data as any).error,
              'API_ERROR',
              response.status,
              data
            );
          }

          return data as T;
        },
        {
          retries: this.config.retries,
          retryDelay: this.config.retryDelay,
          retryableStatuses: this.config.retryableStatuses,
        }
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Extract rate limits from response headers
   */
  private extractRateLimits(headers: Headers): void {
    const limits: RateLimits = {};

    const dailyLimit = headers.get('x-ratelimit-limit-tasks');
    const dailyRemaining = headers.get('x-ratelimit-limit-tasks-remaining');
    if (dailyLimit && dailyRemaining) {
      limits.daily = {
        limit: parseInt(dailyLimit, 10),
        remaining: parseInt(dailyRemaining, 10),
      };
    }

    const monthlyLimit = headers.get('x-ratelimit-limit-tasks-monthly');
    const monthlyRemaining = headers.get(
      'x-ratelimit-limit-tasks-monthly-remaining'
    );
    if (monthlyLimit && monthlyRemaining) {
      limits.monthly = {
        limit: parseInt(monthlyLimit, 10),
        remaining: parseInt(monthlyRemaining, 10),
      };
    }

    const fileSize = headers.get('x-ratelimit-limit-filesize');
    if (fileSize) {
      limits.fileSize = parseInt(fileSize, 10);
    }

    if (Object.keys(limits).length > 0) {
      this.lastRateLimits = limits;
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;

    // Try to parse error message from response
    let errorMessage: string;
    let errorData: any;

    try {
      errorData = await response.json();
      errorMessage = errorData.error || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }

    // Handle specific status codes
    switch (status) {
      case 401:
        throw new AuthenticationError(errorMessage);

      case 400:
        throw new ValidationError(errorMessage, errorData);

      case 404:
        // Determine if it's a file or task not found
        if (errorMessage.toLowerCase().includes('file')) {
          throw new FileNotFoundError(errorMessage);
        } else if (errorMessage.toLowerCase().includes('task')) {
          throw new TaskNotFoundError(errorMessage);
        }
        throw new ConversionToolsError(errorMessage, 'NOT_FOUND', 404);

      case 429:
        throw new RateLimitError(
          errorMessage ||
            'Rate limit exceeded. Upgrade your plan at https://conversiontools.io/pricing',
          this.lastRateLimits
        );

      case 408:
        throw new TimeoutError(errorMessage);

      default:
        throw new ConversionToolsError(
          errorMessage,
          'HTTP_ERROR',
          status,
          errorData
        );
    }
  }

  /**
   * Make a GET request
   */
  async get<T = any>(path: string, options?: Partial<RequestOptions>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      path,
      ...options,
    });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    path: string,
    body?: any,
    options?: Partial<RequestOptions>
  ): Promise<T> {
    return this.request<T>({
      method: 'POST',
      path,
      body,
      ...options,
    });
  }
}
