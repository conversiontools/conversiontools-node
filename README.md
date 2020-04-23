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

```javascript
const ConversionClient = require('conversiontools');

// API Token from your Profile page at https://conversiontools.io/profile
const apiToken = 'put the api token here';

const conversion = new ConversionClient(apiToken);

conversion
  .run('convert.xml_to_csv', {
    filename: 'test.xml',
    timeout: 4000,
    outputFilename: 'test.xml.csv',
    options: {
      delimiter: 'tab',
    },
  })
  .then((filename) => {
    console.log('File downloaded to', filename);
  })
  .catch(err => {
    console.log('Conversion error', err);
  });
```

## Documentation

List of available Conversion Types and corresponding conversion options can be found on the [Conversion Tools API Documentation](https://conversiontools.io/api-documentation) page.

## License

Licensed under [MIT](./LICENSE).

Copyright (c) 2020 [Conversion Tools](https://conversiontools.io)
