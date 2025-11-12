# Conversion Tools - Examples

This directory contains example code showing how to use the Conversion Tools Node.js client library.

## Prerequisites

1. Install the package:
   ```bash
   npm install conversiontools
   ```

2. Get your API token from [https://conversiontools.io/profile](https://conversiontools.io/profile)

3. Set your API token as an environment variable:
   ```bash
   export CONVERSION_TOOLS_API_TOKEN="your-api-token-here"
   ```

## Examples

### Basic Examples

- **`simple-conversion.js`** - Simplest way to convert a file
  ```bash
  node examples/simple-conversion.js
  ```

- **`with-progress.js`** - Track upload and conversion progress
  ```bash
  node examples/with-progress.js
  ```

- **`sandbox-testing.js`** - Test conversions without using quota
  ```bash
  node examples/sandbox-testing.js
  ```

### Advanced Examples

- **`advanced-manual-control.js`** - Full manual control over the conversion process
  ```bash
  node examples/advanced-manual-control.js
  ```

- **`url-conversion.js`** - Convert websites and online files
  ```bash
  node examples/url-conversion.js
  ```

- **`typescript-example.ts`** - TypeScript usage with full type safety
  ```bash
  npx tsx examples/typescript-example.ts
  ```

## Common Conversion Types

```javascript
const { ConversionToolsClient } = require('conversiontools');
const client = new ConversionToolsClient({ apiToken: 'your-token' });

// XML to Excel
await client.convert({
  type: 'convert.xml_to_excel',
  input: './data.xml',
  output: './result.xlsx',
});

// JSON to Excel
await client.convert({
  type: 'convert.json_to_excel',
  input: './data.json',
  output: './result.xlsx',
});

// PDF to Text
await client.convert({
  type: 'convert.pdf_to_text',
  input: './document.pdf',
  output: './document.txt',
});

// Excel to CSV
await client.convert({
  type: 'convert.excel_to_csv',
  input: './spreadsheet.xlsx',
  output: './data.csv',
  options: {
    delimiter: 'comma',
  },
});
```

## Error Handling

```javascript
const {
  ConversionToolsClient,
  RateLimitError,
  ValidationError,
  ConversionError,
} = require('conversiontools');

try {
  await client.convert({ /* ... */ });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded. Upgrade your plan.');
    console.error('Limits:', error.limits);
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof ConversionError) {
    console.error('Conversion failed:', error.message);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## More Information

- Full API Documentation: [https://conversiontools.io/api-documentation](https://conversiontools.io/api-documentation)
- GitHub Repository: [https://github.com/conversiontools/conversiontools-node](https://github.com/conversiontools/conversiontools-node)
- Support: [https://conversiontools.io/contact](https://conversiontools.io/contact)
