/**
 * Progress tracking utilities
 */

import type { ProgressEvent } from '../types/config.js';

/**
 * Create a progress event object
 */
export function createProgressEvent(
  loaded: number,
  total?: number
): ProgressEvent {
  const event: ProgressEvent = {
    loaded,
    total,
  };

  if (total && total > 0) {
    event.percent = Math.round((loaded / total) * 100);
  }

  return event;
}

/**
 * Track upload progress from a stream
 */
export function trackStreamProgress(
  stream: NodeJS.ReadableStream,
  onProgress?: (progress: ProgressEvent) => void,
  total?: number
): NodeJS.ReadableStream {
  if (!onProgress) {
    return stream;
  }

  let loaded = 0;

  stream.on('data', (chunk: Buffer) => {
    loaded += chunk.length;
    onProgress(createProgressEvent(loaded, total));
  });

  return stream;
}

/**
 * Calculate percentage
 */
export function calculatePercent(loaded: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((loaded / total) * 100);
}
