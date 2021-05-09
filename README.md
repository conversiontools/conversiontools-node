# [Conversion Tools](https://conversiontools.io) API Node.js Client

[Conversion Tools](https://conversiontools.io) is an online service that offers a fast and easy way to convert documents between different formats, like XML, Excel, PDF, Word, Text, CSV and others.

This Node.js Client allows integrating the conversion of the files into your node.js applications. To convert the files Node.js Client uses the public [Conversion Tools REST API](https://conversiontools.io/api-documentation).

## Installation

```bash
yarn add conversiontools
```

or

```bash
npm install --save conversiontools
```

## Examples

To use REST API - get API Token from the Profile page at https://conversiontools.io/profile.

### Using Promises

```javascript
const ConversionClient = require('conversiontools');

// API Token from your Profile page at https://conversiontools.io/profile
const apiToken = 'put the api token here';

const conversionClient = new ConversionClient(apiToken);
const conversionOptions = {
  filename: 'test.xml',
  timeout: 4000,
  outputFilename: 'test.xml.csv',
  options: {
    delimiter: 'tab',
  },
};

conversionClient
  .run('convert.xml_to_csv', conversionOptions)
  .then((filename) => {
    console.log('File downloaded to', filename);
  })
  .catch(err => {
    console.error('Conversion error', err);
  });
```

### Using async/await

```javascript
const ConversionClient = require('conversiontools');

// API Token from your Profile page at https://conversiontools.io/profile
const apiToken = 'put the api token here';

const convert = async () => {
  const conversionClient = new ConversionClient(apiToken);
  const conversionOptions = {
    filename: 'test.xml',
    timeout: 4000,
    outputFilename: 'test.xml.csv',
    options: {
      delimiter: 'tab',
    },
  };
  try {
    const filename = await conversionClient.run('convert.xml_to_csv', conversionOptions);
    console.log('File downloaded to', filename);
  } catch (err) {
    console.error('Conversion error', err);
  }
};

convert();
```

### Conversion with URL

The following example saving website page provided by the URL to JPG image.

```javascript
const ConversionClient = require('conversiontools');

// API Token from your Profile page at https://conversiontools.io/profile
const apiToken = 'put the api token here';

const convert = async () => {
  const conversionClient = new ConversionClient(apiToken);
  const conversionOptions = {
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    timeout: 4000,
    outputFilename: 'wiki.jpg',
    options: {
      images: 'yes',
      javascript: 'yes',
    },
  };
  try {
    const filename = await conversionClient.run('convert.website_to_jpg', conversionOptions);
    console.log('File downloaded to', filename);
  } catch (err) {
    console.error('Conversion error', err);
  }
};

convert();
```

## Documentation

List of available Conversion Types and corresponding conversion options can be found on the [Conversion Tools API Documentation](https://conversiontools.io/api-documentation) page.

## License

Licensed under [MIT](./LICENSE).

Copyright (c) 2020-2021 [Conversion Tools](https://conversiontools.io)
