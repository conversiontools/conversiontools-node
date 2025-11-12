/**
 * Retry utilities with exponential backoff
 */

import { NetworkError, TimeoutError } from './errors.js';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  retries: number;

  /** Initial delay between retries in milliseconds */
  retryDelay: number;

  /** HTTP status codes that should trigger retry */
  retryableStatuses: number[];

  /** Function to determine if an error should trigger retry */
  shouldRetry?: (error: any) => boolean;
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error should trigger a retry
 */
function shouldRetryError(
  error: any,
  retryableStatuses: number[],
  shouldRetry?: (error: any) => boolean
): boolean {
  // Custom retry logic
  if (shouldRetry) {
    return shouldRetry(error);
  }

  // Network errors should be retried
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  // HTTP status code based retry
  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }

  // Fetch errors (network issues)
  if (error.name === 'FetchError' || error.code === 'ECONNRESET') {
    return true;
  }

  return false;
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { retries, retryDelay, retryableStatuses, shouldRetry } = options;

  let lastError: any;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      // Don't retry if max attempts reached
      if (attempt > retries) {
        break;
      }

      // Check if error should trigger retry
      if (!shouldRetryError(error, retryableStatuses, shouldRetry)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt - 1);

      // Log retry attempt (optional - could be made configurable)
      if (process.env.DEBUG) {
        console.debug(
          `Retry attempt ${attempt}/${retries} after ${delay}ms. Error: ${
            (error as Error).message || error
          }`
        );
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}
