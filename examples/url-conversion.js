/**
 * URL-based conversion example
 *
 * Convert a website or online file directly from URL
 * without uploading a file first.
 */

const { ConversionToolsClient } = require('conversiontools');

const apiToken = process.env.CONVERSION_TOOLS_API_TOKEN || 'your-api-token-here';

async function main() {
  const client = new ConversionToolsClient({
    apiToken,
  });

  try {
    console.log('Converting website to PDF...');

    // Convert website to PDF
    const outputPath = await client.convert({
      type: 'convert.website_to_pdf',
      input: { url: 'https://conversiontools.io' },
      output: './website.pdf',
      options: {
        images: true,
        javascript: true,
        orientation: 'Portrait',
        pagesize: 'A4',
      },
    });

    console.log(`✓ Website saved to PDF: ${outputPath}`);

    // Convert online image to different format
    console.log('\nConverting website to image...');

    const imagePath = await client.convert({
      type: 'convert.website_to_png',
      input: { url: 'https://conversiontools.io' },
      output: './website.png',
      options: {
        images: true,
        javascript: true,
      },
    });

    console.log(`✓ Website saved to image: ${imagePath}`);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

main();
