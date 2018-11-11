const API = require('./API');

module.exports = class ConversionClient {

  constructor(apiToken) {
    this.api = new API(apiToken);
  }

  checkStatus(taskId, { filename, timeout }) {
    return this.api.getTaskStatus(taskId)
      .then(res => {
        switch (res.status) {
          case 'SUCCESS':
            return this.api.downloadFileTo(res.file_id, filename);
          case 'ERROR':
            throw new Error(res.error);
          case 'PENDING':
          case 'RUNNING':
            // still running, set timeout to check again
            return this.wait(taskId, { filename, timeout });
          default:
            break;
        }
      });
  }

  prepareOptions(optionsArrayToAdd) {
    return Object.assign({}, ...optionsArrayToAdd);
  }

  run(conversionType, { filename, url, outputFilename, timeout = 5000, options }) {
    let conversionPromise;

    if (filename) {
      conversionPromise = this.api.uploadFile(filename)
        .then(res => {
          const taskOptions = this.prepareOptions([options, { file_id: res.file_id }]);
          return this.api.createTask({ type: conversionType, options: taskOptions });
        })
        .catch(err => {
          console.log('Error occured during the file upload');
          throw err;
        });
    }

    if (url) {
      const taskOptions = this.prepareOptions([options, { url }]);
      conversionPromise = this.api.createTask({ type: conversionType, options: taskOptions });
    }

    return conversionPromise
      .then(res => {
        if (res) {
          return this.wait(res.task_id, { filename: outputFilename, timeout });
        }
      });
  }

  wait(taskId, { filename, timeout }) {
    return new Promise(
      resolve => {
        setTimeout(() => {
          return resolve();
        }, timeout);
      })
      .then(() => {
        return this.checkStatus(taskId, { filename, timeout });
      });
  }
};
