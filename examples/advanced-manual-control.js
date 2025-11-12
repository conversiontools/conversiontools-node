/**
 * Advanced example with manual control
 *
 * This example shows how to manually upload files, create tasks,
 * and download results for full control over the conversion process.
 */

const { ConversionToolsClient } = require('conversiontools');

const apiToken = process.env.CONVERSION_TOOLS_API_TOKEN || 'your-api-token-here';

async function main() {
  const client = new ConversionToolsClient({
    apiToken,
  });

  try {
    // Step 1: Upload file manually
    console.log('1. Uploading file...');
    const fileId = await client.files.upload('./data.xml', {
      onProgress: (progress) => {
        console.log(`   Upload progress: ${progress.percent}%`);
      },
    });
    console.log(`   ✓ File uploaded: ${fileId}`);

    // Step 2: Get file info
    console.log('\n2. Getting file info...');
    const fileInfo = await client.files.getInfo(fileId);
    console.log(`   Name: ${fileInfo.name}`);
    console.log(`   Size: ${fileInfo.size} bytes`);

    // Step 3: Create conversion task
    console.log('\n3. Creating conversion task...');
    const task = await client.createTask({
      type: 'convert.xml_to_excel',
      options: {
        file_id: fileId,
        excel_format: 'xlsx',
      },
    });
    console.log(`   ✓ Task created: ${task.id}`);

    // Step 4: Wait for completion with status updates
    console.log('\n4. Waiting for conversion to complete...');
    await task.wait({
      onProgress: (status) => {
        console.log(
          `   Status: ${status.status}, Progress: ${status.conversionProgress}%`
        );
      },
    });
    console.log('   ✓ Conversion complete!');

    // Step 5: Download result
    console.log('\n5. Downloading result...');
    const outputPath = await task.downloadTo('./result.xlsx');
    console.log(`   ✓ Downloaded to: ${outputPath}`);

    // Step 6: Get rate limits
    const limits = client.getRateLimits();
    if (limits) {
      console.log('\n6. Rate limits:');
      if (limits.daily) {
        console.log(
          `   Daily: ${limits.daily.remaining}/${limits.daily.limit} remaining`
        );
      }
      if (limits.monthly) {
        console.log(
          `   Monthly: ${limits.monthly.remaining}/${limits.monthly.limit} remaining`
        );
      }
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.status) {
      console.error(`   Status: ${error.status}`);
    }
    process.exit(1);
  }
}

main();
