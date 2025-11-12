/**
 * Simple conversion example - XML to Excel
 *
 * This example shows the simplest way to convert a file.
 */

const { ConversionToolsClient } = require('conversiontools');

// Get API token from environment or use directly
const apiToken = process.env.CONVERSION_TOOLS_API_TOKEN || 'your-api-token-here';

async function main() {
  // Initialize client
  const client = new ConversionToolsClient({
    apiToken,
  });

  try {
    console.log('Converting XML to Excel...');

    // Simple one-liner conversion
    const outputPath = await client.convert({
      type: 'convert.xml_to_excel',
      input: './test.xml', // Your input file
      output: './result.xlsx', // Output file (optional)
      options: {
        excel_format: 'xlsx',
      },
    });

    console.log(`✓ Conversion successful! File saved to: ${outputPath}`);
  } catch (error) {
    console.error('✗ Conversion failed:', error.message);
    process.exit(1);
  }
}

main();
