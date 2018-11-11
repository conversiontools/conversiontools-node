const fs = require('fs');
const request = require('./request');

module.exports = class API {

  constructor(token) {
    this.token = token;
    this.authorizationHeader = { 'Authorization': `Bearer ${this.token}` };
  }

  prepareHeaders(headersToAdd = {}) {
    return Object.assign({}, this.authorizationHeader, headersToAdd);
  }

  createTask(json) {
    const url = '/tasks';
    const body = request.createRequestBody(json);
    const headers = this.prepareHeaders({ 'Content-Type': 'application/json' });
    return request.callAPI({ url, method: 'POST', body, headers });
  }

  downloadFile(fileId) {
    const url = '/files/' + encodeURIComponent(fileId);
    const headers = this.prepareHeaders();
    return request.callAPI({ url, method: 'GET', headers, raw: true }).then(res => res.body);
  }

  downloadFileTo(fileId, filename) {
    const url = '/files/' + encodeURIComponent(fileId);
    const headers = this.prepareHeaders();
    return request.callAPI({ url, method: 'GET', headers, raw: true })
      .then(res => {
        let filenameForSaving = filename;
        if (typeof filename === 'undefined') {
          const disposition = res.headers.get('content-disposition');
          filenameForSaving = request.getFilenameFromDisposition(disposition) || 'result';
        }
        const dest = fs.createWriteStream(filenameForSaving);
        return new Promise((resolve, reject) => {
          res.body.on('end', () => {
            dest.end();
            return resolve(filenameForSaving);
          });
          res.body.on('error', err => {
            return reject(err);
          });
          res.body.pipe(dest);
        });
      });
  }

  getTaskStatus(taskId) {
    const url = '/tasks/' + encodeURIComponent(taskId);
    const headers = this.prepareHeaders({ 'Content-Type': 'application/json' });
    return request.callAPI({ url, method: 'GET', headers });
  }

  uploadFile(filename) {
    const url = '/files';
    const body = request.createFileRequestBody(filename);
    const headers = this.prepareHeaders();
    return request.callAPI({ url, method: 'POST', body, headers });
  }

};
