/**
 * Legacy v1 API compatibility layer
 *
 * @deprecated This is the v1 API which is deprecated. Please migrate to v2.
 * See migration guide: https://conversiontools.io/api-documentation#upgrade-v1-to-v2
 *
 * @example
 * ```javascript
 * // OLD v1 API (deprecated)
 * const ConversionClient = require('conversiontools/legacy');
 * const client = new ConversionClient(apiToken);
 *
 * await client.run('convert.xml_to_csv', {
 *   filename: 'data.xml',
 *   outputFilename: 'result.csv',
 *   timeout: 5000,
 *   options: { delimiter: 'tab' }
 * });
 *
 * // NEW v2 API (recommended)
 * const { ConversionToolsClient } = require('conversiontools');
 * const client = new ConversionToolsClient({ apiToken });
 *
 * await client.convert({
 *   type: 'convert.xml_to_csv',
 *   input: 'data.xml',
 *   output: 'result.csv',
 *   options: { delimiter: 'tabulation' }
 * });
 * ```
 */

import { ConversionToolsClient } from '../client.js';

// Show deprecation warning once
let warningShown = false;

function showDeprecationWarning(): void {
  if (warningShown) return;
  warningShown = true;

  console.error(
    '\n' +
      '┌─────────────────────────────────────────────────────────────────────┐\n' +
      '│ ⚠️  DEPRECATION WARNING: v1 API is deprecated                        │\n' +
      '│                                                                     │\n' +
      '│ You are using the legacy v1-compatible API from:                    │\n' +
      '│   require("conversiontools/legacy")                                 │\n' +
      '│                                                                     │\n' +
      '│ Please migrate to v2 for improved features and better performance:  │\n' +
      '│   const { ConversionToolsClient } = require("conversiontools");     │\n' +
      '│   const client = new ConversionToolsClient({ apiToken });           │\n' +
      '│                                                                     │\n' +
      '│ Migration guide:                                                    │\n' +
      '│ https://conversiontools.io/api-documentation#upgrade-v1-to-v2       │\n' +
      '└─────────────────────────────────────────────────────────────────────┘\n'
  );
}

/**
 * Legacy v1 API options
 */
interface V1ConversionOptions {
  /** Input file path */
  filename?: string;

  /** Input URL */
  url?: string;

  /** Output file path */
  outputFilename?: string;

  /** Polling timeout in milliseconds */
  timeout?: number;

  /** Conversion-specific options */
  options?: Record<string, any>;
}

/**
 * Legacy ConversionClient class (v1 API)
 *
 * @deprecated Use ConversionToolsClient from 'conversiontools' instead
 */
export default class ConversionClient {
  private readonly client: ConversionToolsClient;

  constructor(apiToken: string) {
    showDeprecationWarning();

    // Initialize v2 client
    this.client = new ConversionToolsClient({
      apiToken,
    });
  }

  /**
   * Run a conversion (v1 API method)
   *
   * @deprecated Use client.convert() instead
   */
  async run(
    conversionType: string,
    options: V1ConversionOptions
  ): Promise<string> {
    const { filename, url, outputFilename, timeout, options: conversionOptions } =
      options;

    // Determine input
    let input: any;
    if (filename) {
      input = filename;
    } else if (url) {
      input = { url };
    } else {
      throw new Error('Either filename or url must be provided');
    }

    // Translate v1 options to v2
    // Note: v1 used string values for some options (e.g., delimiter: 'tab')
    // v2 uses more explicit values (e.g., delimiter: 'tabulation')
    const translatedOptions = this.translateOptions(conversionOptions || {});

    // Convert using v2 API
    return this.client.convert({
      type: conversionType,
      input,
      output: outputFilename,
      options: translatedOptions,
      polling: timeout
        ? {
          interval: timeout,
        }
        : undefined,
    });
  }

  /**
   * Translate v1 option values to v2
   */
  private translateOptions(options: Record<string, any>): Record<string, any> {
    const translated = { ...options };

    // Translate delimiter values
    if (translated.delimiter) {
      const delimiterMap: Record<string, string> = {
        tab: 'tabulation',
        comma: 'comma',
        semicolon: 'semicolon',
        pipe: 'vertical_bar',
        vertical_bar: 'vertical_bar',
      };
      if (delimiterMap[translated.delimiter]) {
        translated.delimiter = delimiterMap[translated.delimiter];
      }
    }

    // Translate yes/no to boolean
    ['images', 'javascript', 'background'].forEach((key) => {
      if (translated[key] === 'yes') {
        translated[key] = true;
      } else if (translated[key] === 'no') {
        translated[key] = false;
      }
    });

    return translated;
  }

  /**
   * Check task status (v1 internal method)
   *
   * @deprecated Not exposed in v1 API, use v2 API instead
   */
  async checkStatus(
    taskId: string,
    options: { filename?: string; timeout?: number }
  ): Promise<string> {
    const task = await this.client.getTask(taskId);

    if (task.isRunning) {
      // Wait with polling
      await task.wait({
        pollingInterval: options.timeout || 5000,
      });
    }

    if (task.isError) {
      throw new Error(task.error || 'Conversion failed');
    }

    // Download result
    return task.downloadTo(options.filename);
  }

}

// Note: Only using default export to avoid mixed export warnings
// For CommonJS compatibility, use: const ConversionClient = require('conversiontools/legacy');
// For ESM compatibility, use: import ConversionClient from 'conversiontools/legacy';
