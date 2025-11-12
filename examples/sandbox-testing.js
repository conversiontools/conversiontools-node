/**
 * Sandbox mode testing
 *
 * This example shows how to use sandbox mode for unlimited testing
 * without consuming your API quota.
 */

const { ConversionToolsClient } = require('conversiontools');

const apiToken = process.env.CONVERSION_TOOLS_API_TOKEN || 'your-api-token-here';

async function main() {
  const client = new ConversionToolsClient({
    apiToken,
  });

  try {
    console.log('Testing conversion in SANDBOX mode (no quota used)...\n');

    // Run conversion in sandbox mode
    const outputPath = await client.convert({
      type: 'convert.xml_to_csv',
      input: './test.xml',
      output: './test-result.csv',
      options: {
        sandbox: true, // ✨ This makes it a sandbox test
        delimiter: 'comma',
      },
    });

    console.log(`✓ Sandbox test complete! File saved to: ${outputPath}`);
    console.log('  Note: This was a test conversion and did not use your quota.');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

main();
