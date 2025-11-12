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
declare class ConversionClient {
    private readonly client;
    constructor(apiToken: string);
    /**
     * Run a conversion (v1 API method)
     *
     * @deprecated Use client.convert() instead
     */
    run(conversionType: string, options: V1ConversionOptions): Promise<string>;
    /**
     * Translate v1 option values to v2
     */
    private translateOptions;
    /**
     * Check task status (v1 internal method)
     *
     * @deprecated Not exposed in v1 API, use v2 API instead
     */
    checkStatus(taskId: string, options: {
        filename?: string;
        timeout?: number;
    }): Promise<string>;
}

export { ConversionClient as default };
