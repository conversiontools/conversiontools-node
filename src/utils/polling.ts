/**
 * Smart polling utilities with exponential backoff
 */

import type { TaskStatusResponse } from '../types/config.js';
import { TimeoutError } from './errors.js';

export interface PollingOptions {
  /** Initial polling interval in milliseconds */
  interval: number;

  /** Maximum polling interval in milliseconds */
  maxInterval: number;

  /** Backoff multiplier */
  backoff: number;

  /** Maximum wait time in milliseconds (0 = no limit) */
  timeout?: number;

  /** Progress callback */
  onProgress?: (status: TaskStatusResponse) => void;
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll a function until a condition is met
 */
export async function poll<T>(
  fn: () => Promise<T>,
  shouldContinue: (result: T) => boolean,
  options: PollingOptions
): Promise<T> {
  const { interval, maxInterval, backoff, timeout, onProgress } = options;

  const startTime = Date.now();
  let currentInterval = interval;
  let result: T;

  while (true) {
    // Execute the function
    result = await fn();

    // Check if we should stop polling
    if (!shouldContinue(result)) {
      return result;
    }

    // Check timeout
    if (timeout && timeout > 0) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new TimeoutError(
          `Polling timed out after ${timeout}ms`,
          timeout
        );
      }
    }

    // Call progress callback
    if (onProgress && typeof result === 'object' && result !== null) {
      onProgress(result as any);
    }

    // Wait before next poll
    await sleep(currentInterval);

    // Increase interval with backoff (capped at maxInterval)
    currentInterval = Math.min(currentInterval * backoff, maxInterval);
  }
}

/**
 * Poll task status until completion
 */
export async function pollTaskStatus(
  getStatus: () => Promise<TaskStatusResponse>,
  options: PollingOptions
): Promise<TaskStatusResponse> {
  return poll(
    getStatus,
    (status) => {
      // Continue polling if task is pending or running
      return status.status === 'PENDING' || status.status === 'RUNNING';
    },
    options
  );
}
