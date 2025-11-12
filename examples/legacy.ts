/**
 * Legacy v1 conversion example - XML to CSV for TypeScript
 *
 * This example shows how to use the legacy (v1.0.0 to v1.0.3) ConversionClient to convert a file.
 */

import ConversionClient from 'conversiontools/legacy';

// Get API token from environment or use directly
const apiToken = process.env.CONVERSION_TOOLS_API_TOKEN || 'your-api-token-here';

const config = {
  type: 'convert.xml_to_csv',
  options: {
    filename: './test.xml',
    timeout: 4000,
    outputFilename: 'result.csv',
  },
};

const convert = async () => {
  try {
    const conversionClient = new ConversionClient(apiToken);
    const filename = await conversionClient.run(config.type, config.options);
    console.log('File downloaded to', filename);
  } catch (err) {
    console.error('Conversion error', err instanceof Error ? err.message : String(err));
  }
};

convert();
