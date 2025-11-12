/**
 * TypeScript example with full type safety
 *
 * This example demonstrates TypeScript usage with full IntelliSense support.
 */

import { ConversionToolsClient, RateLimitError } from 'conversiontools';

const apiToken = process.env.CONVERSION_TOOLS_API_TOKEN || 'your-api-token-here';

async function main() {
  const client = new ConversionToolsClient({
    apiToken,
    timeout: 300000, // 5 minutes
    retries: 3,
  });

  try {
    // TypeScript provides full IntelliSense for conversion options
    const outputPath = await client.convert({
      type: 'convert.xml_to_csv',
      input: './data.xml',
      output: './result.csv',
      options: {
        delimiter: 'comma', // TypeScript suggests valid values!
        quote: true,
        sandbox: false,
      },
    });

    console.log(`✓ Converted successfully: ${outputPath}`);

    // Get rate limits with full type information
    const limits = client.getRateLimits();
    if (limits?.daily) {
      console.log(`Daily limit: ${limits.daily.remaining}/${limits.daily.limit}`);
    }
  } catch (error) {
    // Type-safe error handling
    if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded!');
      console.error('Limits:', error.limits);
      console.error('Upgrade at: https://conversiontools.io/pricing');
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

main();
