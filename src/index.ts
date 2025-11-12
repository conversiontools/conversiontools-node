/**
 * Conversion Tools API Client v2
 *
 * Modern TypeScript/JavaScript library for converting files using the
 * Conversion Tools API at https://conversiontools.io
 *
 * @example
 * ```typescript
 * import { ConversionToolsClient } from 'conversiontools';
 *
 * const client = new ConversionToolsClient({
 *   apiToken: 'your-api-token'
 * });
 *
 * // Simple conversion
 * await client.convert({
 *   type: 'convert.xml_to_excel',
 *   input: './data.xml',
 *   output: './result.xlsx',
 * });
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { ConversionToolsClient } from './client.js';

// Models
export { Task } from './models/Task.js';

// Types
export * from './types/index.js';

// Errors
export * from './utils/errors.js';
