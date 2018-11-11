const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const apiBaseUrl = 'https://api.conversiontools.io/v1';

const callAPI = ({ url, method = 'GET', body, headers, raw = false }) => {
  const request = {
    method: method,
    mode: 'cors',
  };
  if (headers) request.headers = headers;

  if (method === 'POST' && body) {
    request.body = body;
  }

  return fetch(apiBaseUrl + url, request)
    .then((res) => {
      if (res.ok) {
        if (raw) {
          return { headers: res.headers, body: res.body };
        } else {
          return res.json();
        }
      } else {
        const err = new Error(res.status + ' ' + res.statusText);
        err.status = res.status;
        err.statusText = res.statusText;
        throw err;
      }
    })
    .then((res) => {
      if (res.error) {
        const err = new Error(res.error);
        throw err;
      }
      return res;
    });
};

const createRequestBody = json => {
  try {
    return JSON.stringify(json);
  } catch (err) {
    return '';
  }
};

const createFileRequestBody = filename => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filename));
  return form;
};

const getFilenameFromDisposition = disposition => {
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches !== null && matches[1]) { 
      return matches[1].replace(/['"]/g, '');
    }
  }
  return null;
};

module.exports = {
  callAPI,
  createRequestBody,
  createFileRequestBody,
  getFilenameFromDisposition,
};
