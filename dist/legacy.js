import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

// src/utils/errors.ts
var ConversionToolsError = class _ConversionToolsError extends Error {
  constructor(message, code, status, response) {
    super(message);
    this.code = code;
    this.status = status;
    this.response = response;
    this.name = "ConversionToolsError";
    Object.setPrototypeOf(this, _ConversionToolsError.prototype);
  }
};
var AuthenticationError = class _AuthenticationError extends ConversionToolsError {
  constructor(message = "Not authorized - Invalid or missing API token") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, _AuthenticationError.prototype);
  }
};
var ValidationError = class _ValidationError extends ConversionToolsError {
  constructor(message, response) {
    super(message, "VALIDATION_ERROR", 400, response);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};
var RateLimitError = class _RateLimitError extends ConversionToolsError {
  constructor(message, limits) {
    super(message, "RATE_LIMIT_EXCEEDED", 429);
    this.limits = limits;
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, _RateLimitError.prototype);
  }
};
var FileNotFoundError = class _FileNotFoundError extends ConversionToolsError {
  constructor(message = "File not found", fileId) {
    super(message, "FILE_NOT_FOUND", 404);
    this.fileId = fileId;
    this.name = "FileNotFoundError";
    Object.setPrototypeOf(this, _FileNotFoundError.prototype);
  }
};
var TaskNotFoundError = class _TaskNotFoundError extends ConversionToolsError {
  constructor(message = "Task not found", taskId) {
    super(message, "TASK_NOT_FOUND", 404);
    this.taskId = taskId;
    this.name = "TaskNotFoundError";
    Object.setPrototypeOf(this, _TaskNotFoundError.prototype);
  }
};
var ConversionError = class _ConversionError extends ConversionToolsError {
  constructor(message, taskId, taskError) {
    super(message, "CONVERSION_ERROR");
    this.taskId = taskId;
    this.taskError = taskError;
    this.name = "ConversionError";
    Object.setPrototypeOf(this, _ConversionError.prototype);
  }
};
var TimeoutError = class _TimeoutError extends ConversionToolsError {
  constructor(message = "Operation timed out", timeout) {
    super(message, "TIMEOUT_ERROR", 408);
    this.timeout = timeout;
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, _TimeoutError.prototype);
  }
};
var NetworkError = class _NetworkError extends ConversionToolsError {
  constructor(message, originalError) {
    super(message, "NETWORK_ERROR");
    this.originalError = originalError;
    this.name = "NetworkError";
    Object.setPrototypeOf(this, _NetworkError.prototype);
  }
};

// src/utils/retry.ts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function shouldRetryError(error, retryableStatuses, shouldRetry) {
  if (shouldRetry) {
    return shouldRetry(error);
  }
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }
  if (error.name === "FetchError" || error.code === "ECONNRESET") {
    return true;
  }
  return false;
}
async function withRetry(fn, options) {
  const { retries, retryDelay, retryableStatuses, shouldRetry } = options;
  let lastError;
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt > retries) {
        break;
      }
      if (!shouldRetryError(error, retryableStatuses, shouldRetry)) {
        throw error;
      }
      const delay = retryDelay * Math.pow(2, attempt - 1);
      if (process.env.DEBUG) {
        console.debug(
          `Retry attempt ${attempt}/${retries} after ${delay}ms. Error: ${error.message || error}`
        );
      }
      await sleep(delay);
    }
  }
  throw lastError;
}

// src/api/http.ts
var DEFAULT_BASE_URL = "https://api.conversiontools.io/v1";
var DEFAULT_TIMEOUT = 3e5;
var DEFAULT_RETRIES = 3;
var DEFAULT_RETRY_DELAY = 1e3;
var DEFAULT_RETRYABLE_STATUSES = [408, 500, 502, 503, 504];
var HttpClient = class {
  constructor(config) {
    this.config = {
      apiToken: config.apiToken,
      baseURL: config.baseURL || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      retries: config.retries || DEFAULT_RETRIES,
      retryDelay: config.retryDelay || DEFAULT_RETRY_DELAY,
      retryableStatuses: config.retryableStatuses || DEFAULT_RETRYABLE_STATUSES,
      userAgent: config.userAgent
    };
  }
  /**
   * Get the last rate limits from API response headers
   */
  getRateLimits() {
    return this.lastRateLimits;
  }
  /**
   * Make an HTTP request with retry logic
   */
  async request(options) {
    const { method, path: path2, body, headers, raw, signal } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );
    if (signal) {
      signal.addEventListener("abort", () => controller.abort());
    }
    try {
      return await withRetry(
        async () => {
          const url = `${this.config.baseURL}${path2}`;
          const requestHeaders = {
            Authorization: `Bearer ${this.config.apiToken}`,
            ...headers
          };
          if (this.config.userAgent) {
            requestHeaders["User-Agent"] = this.config.userAgent;
          }
          if (body && typeof body === "string") {
            requestHeaders["Content-Type"] = "application/json";
          }
          let response;
          try {
            response = await fetch(url, {
              method,
              headers: requestHeaders,
              body: body instanceof FormData || typeof body === "string" ? body : void 0,
              signal: controller.signal
            });
          } catch (error) {
            if (error.name === "AbortError") {
              throw new TimeoutError(
                `Request timed out after ${this.config.timeout}ms`,
                this.config.timeout
              );
            }
            throw new NetworkError(
              `Network request failed: ${error.message}`,
              error
            );
          }
          this.extractRateLimits(response.headers);
          if (!response.ok) {
            await this.handleErrorResponse(response);
          }
          if (raw) {
            return response;
          }
          const data = await response.json();
          if (data.error) {
            throw new ConversionToolsError(
              data.error,
              "API_ERROR",
              response.status,
              data
            );
          }
          return data;
        },
        {
          retries: this.config.retries,
          retryDelay: this.config.retryDelay,
          retryableStatuses: this.config.retryableStatuses
        }
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
  /**
   * Extract rate limits from response headers
   */
  extractRateLimits(headers) {
    const limits = {};
    const dailyLimit = headers.get("x-ratelimit-limit-tasks");
    const dailyRemaining = headers.get("x-ratelimit-limit-tasks-remaining");
    if (dailyLimit && dailyRemaining) {
      limits.daily = {
        limit: parseInt(dailyLimit, 10),
        remaining: parseInt(dailyRemaining, 10)
      };
    }
    const monthlyLimit = headers.get("x-ratelimit-limit-tasks-monthly");
    const monthlyRemaining = headers.get(
      "x-ratelimit-limit-tasks-monthly-remaining"
    );
    if (monthlyLimit && monthlyRemaining) {
      limits.monthly = {
        limit: parseInt(monthlyLimit, 10),
        remaining: parseInt(monthlyRemaining, 10)
      };
    }
    const fileSize = headers.get("x-ratelimit-limit-filesize");
    if (fileSize) {
      limits.fileSize = parseInt(fileSize, 10);
    }
    if (Object.keys(limits).length > 0) {
      this.lastRateLimits = limits;
    }
  }
  /**
   * Handle error responses
   */
  async handleErrorResponse(response) {
    const status = response.status;
    let errorMessage;
    let errorData;
    try {
      errorData = await response.json();
      errorMessage = errorData.error || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }
    switch (status) {
      case 401:
        throw new AuthenticationError(errorMessage);
      case 400:
        throw new ValidationError(errorMessage, errorData);
      case 404:
        if (errorMessage.toLowerCase().includes("file")) {
          throw new FileNotFoundError(errorMessage);
        } else if (errorMessage.toLowerCase().includes("task")) {
          throw new TaskNotFoundError(errorMessage);
        }
        throw new ConversionToolsError(errorMessage, "NOT_FOUND", 404);
      case 429:
        throw new RateLimitError(
          errorMessage || "Rate limit exceeded. Upgrade your plan at https://conversiontools.io/pricing",
          this.lastRateLimits
        );
      case 408:
        throw new TimeoutError(errorMessage);
      default:
        throw new ConversionToolsError(
          errorMessage,
          "HTTP_ERROR",
          status,
          errorData
        );
    }
  }
  /**
   * Make a GET request
   */
  async get(path2, options) {
    return this.request({
      method: "GET",
      path: path2,
      ...options
    });
  }
  /**
   * Make a POST request
   */
  async post(path2, body, options) {
    return this.request({
      method: "POST",
      path: path2,
      body,
      ...options
    });
  }
};

// src/utils/validation.ts
function validateConversionType(type) {
  if (!type || typeof type !== "string") {
    throw new ValidationError("Conversion type is required and must be a string");
  }
  if (!type.startsWith("convert.")) {
    throw new ValidationError(
      `Invalid conversion type format: "${type}". Expected format: "convert.source_to_target"`
    );
  }
}
function validateConversionInput(input) {
  if (!input) {
    throw new ValidationError("Input is required");
  }
  if (typeof input === "string") {
    return { type: "path", value: input };
  }
  if (typeof input === "object" && input !== null) {
    if ("path" in input && typeof input.path === "string") {
      return { type: "path", value: input.path };
    }
    if ("url" in input && typeof input.url === "string") {
      if (!isValidUrl(input.url)) {
        throw new ValidationError(`Invalid URL: ${input.url}`);
      }
      return { type: "url", value: input.url };
    }
    if ("stream" in input && input.stream) {
      return { type: "stream", value: input.stream };
    }
    if ("buffer" in input && Buffer.isBuffer(input.buffer)) {
      return { type: "buffer", value: input };
    }
    if ("fileId" in input && typeof input.fileId === "string") {
      return { type: "fileId", value: input.fileId };
    }
  }
  throw new ValidationError(
    "Invalid input format. Expected: string, { path }, { url }, { stream }, { buffer }, or { fileId }"
  );
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function validateApiToken(token) {
  if (!token || typeof token !== "string") {
    throw new ValidationError("API token is required and must be a string");
  }
  if (token.trim().length === 0) {
    throw new ValidationError("API token cannot be empty");
  }
}
function validateFileId(fileId) {
  if (!fileId || typeof fileId !== "string") {
    throw new ValidationError("File ID is required and must be a string");
  }
  if (!/^[a-f0-9]{32}$/i.test(fileId)) {
    throw new ValidationError(
      `Invalid file ID format: "${fileId}". Expected 32-character hexadecimal string`
    );
  }
}
function validateTaskId(taskId) {
  if (!taskId || typeof taskId !== "string") {
    throw new ValidationError("Task ID is required and must be a string");
  }
  if (!/^[a-f0-9]{32}$/i.test(taskId)) {
    throw new ValidationError(
      `Invalid task ID format: "${taskId}". Expected 32-character hexadecimal string`
    );
  }
}

// src/utils/progress.ts
function createProgressEvent(loaded, total) {
  const event = {
    loaded,
    total
  };
  if (total && total > 0) {
    event.percent = Math.round(loaded / total * 100);
  }
  return event;
}
function trackStreamProgress(stream, onProgress, total) {
  if (!onProgress) {
    return stream;
  }
  let loaded = 0;
  stream.on("data", (chunk) => {
    loaded += chunk.length;
    onProgress(createProgressEvent(loaded, total));
  });
  return stream;
}

// src/api/files.ts
var FilesAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Upload a file from various sources
   */
  async upload(input, options) {
    let stream;
    let filename;
    let fileSize;
    if (typeof input === "string") {
      if (!fs.existsSync(input)) {
        throw new ValidationError(`File not found: ${input}`);
      }
      const stats = fs.statSync(input);
      if (!stats.isFile()) {
        throw new ValidationError(`Not a file: ${input}`);
      }
      stream = fs.createReadStream(input);
      filename = path.basename(input);
      fileSize = stats.size;
    } else if (Buffer.isBuffer(input)) {
      stream = Readable.from(input);
      fileSize = input.length;
    } else {
      stream = input;
    }
    if (options?.onProgress) {
      stream = trackStreamProgress(stream, options.onProgress, fileSize);
    }
    const formData = new FormData();
    const chunks = [];
    for await (const chunk of stream) {
      if (typeof chunk === "string") {
        chunks.push(new TextEncoder().encode(chunk));
      } else if (chunk instanceof Buffer) {
        chunks.push(new Uint8Array(chunk));
      } else {
        chunks.push(chunk);
      }
    }
    const blob = new Blob(chunks);
    formData.append("file", blob, filename || "file");
    const response = await this.http.post("/files", formData);
    if (response.error) {
      throw new ValidationError(response.error);
    }
    return response.file_id;
  }
  /**
   * Get file metadata
   */
  async getInfo(fileId) {
    validateFileId(fileId);
    return this.http.get(`/files/${encodeURIComponent(fileId)}/info`);
  }
  /**
   * Download file as stream
   */
  async downloadStream(fileId) {
    validateFileId(fileId);
    const response = await this.http.get(`/files/${encodeURIComponent(fileId)}`, {
      raw: true
    });
    if (!response.body) {
      throw new ValidationError("No response body");
    }
    return Readable.fromWeb(response.body);
  }
  /**
   * Download file as buffer
   */
  async downloadBuffer(fileId) {
    validateFileId(fileId);
    const response = await this.http.get(`/files/${encodeURIComponent(fileId)}`, {
      raw: true
    });
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  /**
   * Download file to path
   */
  async downloadTo(fileId, outputPath, onProgress) {
    validateFileId(fileId);
    const response = await this.http.get(`/files/${encodeURIComponent(fileId)}`, {
      raw: true
    });
    let filename = outputPath;
    if (!filename) {
      const disposition = response.headers.get("content-disposition");
      if (disposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
          disposition
        );
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }
      filename = filename || "result";
    }
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!response.body) {
      throw new ValidationError("No response body");
    }
    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : void 0;
    let nodeStream = Readable.fromWeb(response.body);
    if (onProgress) {
      nodeStream = trackStreamProgress(nodeStream, onProgress, total);
    }
    const writeStream = fs.createWriteStream(filename);
    await new Promise((resolve, reject) => {
      nodeStream.pipe(writeStream);
      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
      nodeStream.on("error", reject);
    });
    return filename;
  }
};

// src/api/tasks.ts
var TasksAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Create a new conversion task
   */
  async create(request) {
    validateConversionType(request.type);
    const response = await this.http.post(
      "/tasks",
      JSON.stringify(request)
    );
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  }
  /**
   * Get task status
   */
  async getStatus(taskId) {
    validateTaskId(taskId);
    const response = await this.http.get(
      `/tasks/${encodeURIComponent(taskId)}`
    );
    return response;
  }
  /**
   * List all tasks (optionally filtered by status)
   */
  async list(options) {
    let path2 = "/tasks";
    if (options?.status) {
      path2 += `?status=${encodeURIComponent(options.status)}`;
    }
    const response = await this.http.get(
      path2
    );
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  }
};

// src/api/config.ts
var ConfigAPI = class {
  constructor(http) {
    this.http = http;
  }
  /**
   * Get authenticated user info
   */
  async getUserInfo() {
    const response = await this.http.get("/auth");
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  }
  /**
   * Get API configuration (available conversion types)
   */
  async getConfig() {
    const response = await this.http.get("/config");
    if (response.error) {
      throw new Error(response.error);
    }
    return response;
  }
};

// src/utils/polling.ts
function sleep2(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function poll(fn, shouldContinue, options) {
  const { interval, maxInterval, backoff, timeout, onProgress } = options;
  const startTime = Date.now();
  let currentInterval = interval;
  let result;
  while (true) {
    result = await fn();
    if (!shouldContinue(result)) {
      return result;
    }
    if (timeout && timeout > 0) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new TimeoutError(
          `Polling timed out after ${timeout}ms`,
          timeout
        );
      }
    }
    if (onProgress && typeof result === "object" && result !== null) {
      onProgress(result);
    }
    await sleep2(currentInterval);
    currentInterval = Math.min(currentInterval * backoff, maxInterval);
  }
}
async function pollTaskStatus(getStatus, options) {
  return poll(
    getStatus,
    (status) => {
      return status.status === "PENDING" || status.status === "RUNNING";
    },
    options
  );
}

// src/models/Task.ts
var Task = class {
  constructor(options, tasksAPI, filesAPI) {
    this.id = options.id;
    this.type = options.type;
    this._status = options.status || "PENDING";
    this._fileId = options.fileId || null;
    this._error = options.error || null;
    this._conversionProgress = options.conversionProgress || 0;
    this.tasksAPI = tasksAPI;
    this.filesAPI = filesAPI;
    this.defaultPolling = options.defaultPolling || {
      interval: 5e3,
      maxInterval: 3e4,
      backoff: 1.5
    };
  }
  /**
   * Get current status
   */
  get status() {
    return this._status;
  }
  /**
   * Get result file ID
   */
  get fileId() {
    return this._fileId;
  }
  /**
   * Get error message
   */
  get error() {
    return this._error;
  }
  /**
   * Get conversion progress (0-100)
   */
  get conversionProgress() {
    return this._conversionProgress;
  }
  /**
   * Check if task is complete (success or error)
   */
  get isComplete() {
    return this._status === "SUCCESS" || this._status === "ERROR";
  }
  /**
   * Check if task succeeded
   */
  get isSuccess() {
    return this._status === "SUCCESS";
  }
  /**
   * Check if task failed
   */
  get isError() {
    return this._status === "ERROR";
  }
  /**
   * Check if task is still running
   */
  get isRunning() {
    return this._status === "PENDING" || this._status === "RUNNING";
  }
  /**
   * Refresh task status from API
   */
  async refresh() {
    const response = await this.tasksAPI.getStatus(this.id);
    this.updateFromResponse(response);
  }
  /**
   * Get task status (alias for refresh)
   */
  async getStatus() {
    const response = await this.tasksAPI.getStatus(this.id);
    this.updateFromResponse(response);
    return response;
  }
  /**
   * Wait for task to complete
   */
  async wait(options) {
    const pollingOptions = {
      interval: options?.pollingInterval || this.defaultPolling.interval,
      maxInterval: options?.maxPollingInterval || this.defaultPolling.maxInterval,
      backoff: this.defaultPolling.backoff,
      timeout: options?.timeout,
      onProgress: options?.onProgress
    };
    const finalStatus = await pollTaskStatus(
      () => this.getStatus(),
      pollingOptions
    );
    this.updateFromResponse(finalStatus);
    if (this._status === "ERROR") {
      throw new ConversionError(
        this._error || "Conversion failed",
        this.id,
        this._error || void 0
      );
    }
  }
  /**
   * Download result file as stream
   */
  async downloadStream() {
    if (!this._fileId) {
      throw new ConversionError(
        "No result file available. Task may not be complete.",
        this.id
      );
    }
    return this.filesAPI.downloadStream(this._fileId);
  }
  /**
   * Download result file as buffer
   */
  async downloadBuffer() {
    if (!this._fileId) {
      throw new ConversionError(
        "No result file available. Task may not be complete.",
        this.id
      );
    }
    return this.filesAPI.downloadBuffer(this._fileId);
  }
  /**
   * Download result file to path
   */
  async downloadTo(outputPath, onProgress) {
    if (!this._fileId) {
      throw new ConversionError(
        "No result file available. Task may not be complete.",
        this.id
      );
    }
    return this.filesAPI.downloadTo(this._fileId, outputPath, onProgress);
  }
  /**
   * Update task state from API response
   */
  updateFromResponse(response) {
    this._status = response.status;
    this._fileId = response.file_id;
    this._error = response.error;
    this._conversionProgress = response.conversionProgress;
  }
  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      status: this._status,
      fileId: this._fileId,
      error: this._error,
      conversionProgress: this._conversionProgress
    };
  }
};

// src/client.ts
var VERSION = "2.0.3";
var ConversionToolsClient = class {
  constructor(config) {
    validateApiToken(config.apiToken);
    this.config = {
      apiToken: config.apiToken,
      baseURL: config.baseURL || "https://api.conversiontools.io/v1",
      timeout: config.timeout || 3e5,
      retries: config.retries !== void 0 ? config.retries : 3,
      retryDelay: config.retryDelay || 1e3,
      retryableStatuses: config.retryableStatuses || [408, 500, 502, 503, 504],
      pollingInterval: config.pollingInterval || 5e3,
      maxPollingInterval: config.maxPollingInterval || 3e4,
      pollingBackoff: config.pollingBackoff || 1.5,
      webhookUrl: config.webhookUrl,
      userAgent: config.userAgent || `conversiontools-node/${VERSION}`,
      onUploadProgress: config.onUploadProgress,
      onDownloadProgress: config.onDownloadProgress,
      onConversionProgress: config.onConversionProgress
    };
    this.http = new HttpClient({
      apiToken: this.config.apiToken,
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
      retryableStatuses: this.config.retryableStatuses,
      userAgent: this.config.userAgent
    });
    this.files = new FilesAPI(this.http);
    this.tasks = new TasksAPI(this.http);
    this.configAPI = new ConfigAPI(this.http);
  }
  /**
   * Simple conversion method - upload, convert, wait, and download in one call
   */
  async convert(options) {
    const {
      type,
      input,
      output,
      options: conversionOptions,
      wait = true,
      callbackUrl,
      polling
    } = options;
    const inputInfo = validateConversionInput(input);
    let fileId;
    let taskOptions = {
      ...conversionOptions
    };
    if (inputInfo.type === "fileId") {
      fileId = inputInfo.value;
      taskOptions.file_id = fileId;
    } else if (inputInfo.type === "url") {
      taskOptions.url = inputInfo.value;
    } else {
      if (inputInfo.type === "path") {
        fileId = await this.files.upload(inputInfo.value, {
          onProgress: this.config.onUploadProgress
        });
      } else if (inputInfo.type === "stream") {
        fileId = await this.files.upload(inputInfo.value, {
          onProgress: this.config.onUploadProgress
        });
      } else if (inputInfo.type === "buffer") {
        fileId = await this.files.upload(inputInfo.value.buffer, {
          onProgress: this.config.onUploadProgress
        });
      }
      if (fileId) {
        taskOptions.file_id = fileId;
      }
    }
    const task = await this.createTask({
      type,
      options: taskOptions,
      callbackUrl: callbackUrl || this.config.webhookUrl
    });
    if (!wait) {
      return task.id;
    }
    await task.wait({
      pollingInterval: polling?.interval || this.config.pollingInterval,
      maxPollingInterval: polling?.maxInterval || this.config.maxPollingInterval,
      onProgress: (status) => {
        if (this.config.onConversionProgress) {
          this.config.onConversionProgress({
            loaded: status.conversionProgress,
            total: 100,
            percent: status.conversionProgress,
            status: status.status,
            taskId: task.id
          });
        }
      }
    });
    const outputPath = await task.downloadTo(output, this.config.onDownloadProgress);
    return outputPath;
  }
  /**
   * Create a conversion task (low-level API)
   */
  async createTask(request) {
    const response = await this.tasks.create(request);
    return new Task(
      {
        id: response.task_id,
        type: String(request.type),
        status: "PENDING",
        defaultPolling: {
          interval: this.config.pollingInterval,
          maxInterval: this.config.maxPollingInterval,
          backoff: this.config.pollingBackoff
        }
      },
      this.tasks,
      this.files
    );
  }
  /**
   * Get an existing task by ID
   */
  async getTask(taskId) {
    const response = await this.tasks.getStatus(taskId);
    return new Task(
      {
        id: taskId,
        type: "",
        // Type not available from status response
        status: response.status,
        fileId: response.file_id,
        error: response.error,
        conversionProgress: response.conversionProgress,
        defaultPolling: {
          interval: this.config.pollingInterval,
          maxInterval: this.config.maxPollingInterval,
          backoff: this.config.pollingBackoff
        }
      },
      this.tasks,
      this.files
    );
  }
  /**
   * Get rate limits from last API call
   */
  getRateLimits() {
    return this.http.getRateLimits();
  }
  /**
   * Get authenticated user information
   */
  async getUser() {
    return this.configAPI.getUserInfo();
  }
  /**
   * Get API configuration (available conversion types)
   */
  async getConfig() {
    return this.configAPI.getConfig();
  }
};

// src/legacy/index.ts
var warningShown = false;
function showDeprecationWarning() {
  if (warningShown) return;
  warningShown = true;
  console.error(
    '\n\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502 \u26A0\uFE0F  DEPRECATION WARNING: v1 API is deprecated                        \u2502\n\u2502                                                                     \u2502\n\u2502 You are using the legacy v1-compatible API from:                    \u2502\n\u2502   require("conversiontools/legacy")                                 \u2502\n\u2502                                                                     \u2502\n\u2502 Please migrate to v2 for improved features and better performance:  \u2502\n\u2502   const { ConversionToolsClient } = require("conversiontools");     \u2502\n\u2502   const client = new ConversionToolsClient({ apiToken });           \u2502\n\u2502                                                                     \u2502\n\u2502 Migration guide:                                                    \u2502\n\u2502 https://conversiontools.io/api-documentation#upgrade-v1-to-v2       \u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n'
  );
}
var ConversionClient = class {
  constructor(apiToken) {
    showDeprecationWarning();
    this.client = new ConversionToolsClient({
      apiToken
    });
  }
  /**
   * Run a conversion (v1 API method)
   *
   * @deprecated Use client.convert() instead
   */
  async run(conversionType, options) {
    const { filename, url, outputFilename, timeout, options: conversionOptions } = options;
    let input;
    if (filename) {
      input = filename;
    } else if (url) {
      input = { url };
    } else {
      throw new Error("Either filename or url must be provided");
    }
    const translatedOptions = this.translateOptions(conversionOptions || {});
    return this.client.convert({
      type: conversionType,
      input,
      output: outputFilename,
      options: translatedOptions,
      polling: timeout ? {
        interval: timeout
      } : void 0
    });
  }
  /**
   * Translate v1 option values to v2
   */
  translateOptions(options) {
    const translated = { ...options };
    if (translated.delimiter) {
      const delimiterMap = {
        tab: "tabulation",
        comma: "comma",
        semicolon: "semicolon",
        pipe: "vertical_bar",
        vertical_bar: "vertical_bar"
      };
      if (delimiterMap[translated.delimiter]) {
        translated.delimiter = delimiterMap[translated.delimiter];
      }
    }
    ["images", "javascript", "background"].forEach((key) => {
      if (translated[key] === "yes") {
        translated[key] = true;
      } else if (translated[key] === "no") {
        translated[key] = false;
      }
    });
    return translated;
  }
  /**
   * Check task status (v1 internal method)
   *
   * @deprecated Not exposed in v1 API, use v2 API instead
   */
  async checkStatus(taskId, options) {
    const task = await this.client.getTask(taskId);
    if (task.isRunning) {
      await task.wait({
        pollingInterval: options.timeout || 5e3
      });
    }
    if (task.isError) {
      throw new Error(task.error || "Conversion failed");
    }
    return task.downloadTo(options.filename);
  }
};

export { ConversionClient as default };
//# sourceMappingURL=legacy.js.map
//# sourceMappingURL=legacy.js.map