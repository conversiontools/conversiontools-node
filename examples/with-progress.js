/**
 * Conversion with progress tracking
 *
 * This example shows how to track upload and conversion progress.
 */

const { ConversionToolsClient } = require('conversiontools');

const apiToken = process.env.CONVERSION_TOOLS_API_TOKEN || 'your-api-token-here';

async function main() {
  // Initialize client with progress callbacks
  const client = new ConversionToolsClient({
    apiToken,
    onUploadProgress: (progress) => {
      console.log(`Upload: ${progress.percent}%`);
    },
    onConversionProgress: (progress) => {
      console.log(`Converting: ${progress.percent}% (${progress.status})`);
    },
    onDownloadProgress: (progress) => {
      console.log(`Download: ${progress.percent}%`);
    },
  });

  try {
    console.log('Converting large JSON file to Excel...');

    const outputPath = await client.convert({
      type: 'convert.json_to_excel',
      input: './large-data.json',
      output: './result.xlsx',
      options: {
        excel_format: 'xlsx',
      },
    });

    console.log(`✓ Done! File saved to: ${outputPath}`);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

main();
