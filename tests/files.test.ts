import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'stream';
import { FilesAPI, buildMultipartStream, sanitizeFilename } from '../src/api/files';
import { HttpClient } from '../src/api/http';
import { ValidationError } from '../src/utils/errors';
import * as fs from 'fs';

vi.mock('fs');

vi.mock('../src/api/http', () => ({
  HttpClient: vi.fn().mockImplementation(() => ({
    post: vi.fn(),
    postStream: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('FilesAPI', () => {
  let filesAPI: FilesAPI;
  let mockHttpClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttpClient = {
      post: vi.fn(),
      postStream: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };
    filesAPI = new FilesAPI(mockHttpClient as HttpClient);
  });

  describe('upload', () => {
    it('uploads from a file path', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({
        isFile: () => true,
        size: 9,
      } as any);
      vi.mocked(fs.createReadStream).mockReturnValue(Readable.from(Buffer.from('test data')) as any);

      mockHttpClient.postStream.mockResolvedValue({
        error: null,
        file_id: '12345678901234567890123456789012',
      });

      const fileId = await filesAPI.upload('./test.xml');

      expect(fileId).toBe('12345678901234567890123456789012');
      expect(fs.existsSync).toHaveBeenCalledWith('./test.xml');
      expect(mockHttpClient.postStream).toHaveBeenCalledOnce();
      const [path, body, contentType] = mockHttpClient.postStream.mock.calls[0];
      expect(path).toBe('/files');
      expect(body).toBeInstanceOf(ReadableStream);
      expect(contentType).toMatch(/^multipart\/form-data; boundary=----conversiontools-/);
    });

    it('throws ValidationError for non-existent file', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(filesAPI.upload('./nonexistent.xml')).rejects.toThrow(ValidationError);
      await expect(filesAPI.upload('./nonexistent.xml')).rejects.toThrow('File not found');
      expect(mockHttpClient.postStream).not.toHaveBeenCalled();
    });

    it('throws ValidationError for directories', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => false } as any);

      await expect(filesAPI.upload('./adir')).rejects.toThrow(/Not a file/);
    });

    it('uploads from a Buffer', async () => {
      mockHttpClient.postStream.mockResolvedValue({
        error: null,
        file_id: 'buffer_file_id_xxxxxxxxxxxxxxxxx'.slice(0, 32),
      });

      const fileId = await filesAPI.upload(Buffer.from('test data'));

      expect(fileId).toBe('buffer_file_id_xxxxxxxxxxxxxxxxxx'.slice(0, 32));
      expect(mockHttpClient.postStream).toHaveBeenCalledOnce();
    });

    it('uploads from a Node ReadableStream', async () => {
      mockHttpClient.postStream.mockResolvedValue({
        error: null,
        file_id: 'stream_file_id_xxxxxxxxxxxxxxxxx'.slice(0, 32),
      });

      const source = Readable.from(Buffer.from('streamed content'));
      const fileId = await filesAPI.upload(source);

      expect(fileId).toBe('stream_file_id_xxxxxxxxxxxxxxxxxx'.slice(0, 32));
      const [, body] = mockHttpClient.postStream.mock.calls[0];
      expect(body).toBeInstanceOf(ReadableStream);
    });

    it('passes a multipart body whose payload contains the source bytes', async () => {
      mockHttpClient.postStream.mockResolvedValue({
        error: null,
        file_id: '12345678901234567890123456789012',
      });

      const source = Readable.from(Buffer.from('hello multipart world'));
      await filesAPI.upload(source);

      const [, body] = mockHttpClient.postStream.mock.calls[0];
      const reader = (body as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const total = Buffer.concat(chunks.map((c) => Buffer.from(c)));
      const text = total.toString('utf8');

      expect(text).toContain('hello multipart world');
      expect(text).toMatch(/Content-Disposition: form-data; name="file"; filename="/);
      expect(text).toMatch(/Content-Type: application\/octet-stream/);
      // closing boundary `--<boundary>--` ends the multipart envelope
      expect(text).toMatch(/--\r\n$/);
    });

    it('preserves binary bytes through the multipart body', async () => {
      mockHttpClient.postStream.mockResolvedValue({
        error: null,
        file_id: '12345678901234567890123456789012',
      });

      const binary = Buffer.from([0x00, 0xff, 0x01, 0xfe, 0x80, 0x7f, 0xde, 0xad, 0xbe, 0xef]);
      await filesAPI.upload(Readable.from(binary));

      const [, body] = mockHttpClient.postStream.mock.calls[0];
      const reader = (body as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const all = Buffer.concat(chunks.map((c) => Buffer.from(c)));
      const idx = all.indexOf(binary);
      expect(idx).toBeGreaterThan(-1);
    });

    it('streams large inputs without buffering them all at once', async () => {
      mockHttpClient.postStream.mockImplementation(async (_path: string, body: ReadableStream<Uint8Array>) => {
        const reader = body.getReader();
        let total = 0;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) total += value.byteLength;
        }
        return { error: null, file_id: '12345678901234567890123456789012', _total: total };
      });

      const chunkSize = 64 * 1024;
      const chunkCount = 32;
      const source = new Readable({
        read() {
          if ((this as any)._sent === undefined) (this as any)._sent = 0;
          if ((this as any)._sent >= chunkCount) {
            this.push(null);
            return;
          }
          this.push(Buffer.alloc(chunkSize, (this as any)._sent & 0xff));
          (this as any)._sent += 1;
        },
      });

      const fileId = await filesAPI.upload(source);
      expect(fileId).toBe('12345678901234567890123456789012');

      const result = mockHttpClient.postStream.mock.results[0].value;
      const resolved = await result;
      expect(resolved._total).toBeGreaterThanOrEqual(chunkSize * chunkCount);
    });

    it('propagates source stream errors as ReadableStream errors', async () => {
      mockHttpClient.postStream.mockImplementation(async (_path: string, body: ReadableStream<Uint8Array>) => {
        const reader = body.getReader();
        try {
          for (;;) {
            const { done } = await reader.read();
            if (done) break;
          }
          return { error: null, file_id: '12345678901234567890123456789012' };
        } catch (err) {
          throw err;
        }
      });

      const boom = new Readable({
        read() {
          this.destroy(new Error('source-blew-up'));
        },
      });

      await expect(filesAPI.upload(boom)).rejects.toThrow(/source-blew-up/);
    });

    it('rejects when API response carries an error', async () => {
      mockHttpClient.postStream.mockResolvedValue({
        error: 'quota exceeded',
        file_id: '',
      });

      await expect(filesAPI.upload(Buffer.from('x'))).rejects.toThrow(ValidationError);
      await expect(filesAPI.upload(Buffer.from('x'))).rejects.toThrow('quota exceeded');
    });

    it('invokes onProgress for path input with file size', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true, size: 9 } as any);
      vi.mocked(fs.createReadStream).mockReturnValue(Readable.from(Buffer.from('test data')) as any);

      mockHttpClient.postStream.mockImplementation(async (_path: string, body: ReadableStream<Uint8Array>) => {
        const reader = body.getReader();
        for (;;) {
          const { done } = await reader.read();
          if (done) break;
        }
        return { error: null, file_id: '12345678901234567890123456789012' };
      });

      const events: number[] = [];
      const onProgress = vi.fn((p) => events.push(p.loaded));

      await filesAPI.upload('./test.xml', { onProgress });

      expect(onProgress).toHaveBeenCalled();
      expect(events[events.length - 1]).toBeGreaterThanOrEqual(9);
    });

    it('attaches a safe filename when basename contains quotes', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true, size: 4 } as any);
      vi.mocked(fs.createReadStream).mockReturnValue(Readable.from(Buffer.from('data')) as any);

      mockHttpClient.postStream.mockResolvedValue({
        error: null,
        file_id: '12345678901234567890123456789012',
      });

      // Use only a basename — path.basename behaves differently per-platform on separators
      await filesAPI.upload('na"me.txt');

      const [, body] = mockHttpClient.postStream.mock.calls[0];
      const reader = (body as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');

      expect(text).toMatch(/filename="na_me\.txt"/);
    });
  });

  describe('buildMultipartStream', () => {
    it('emits head, body, then tail in order', async () => {
      const head = Buffer.from('HEAD');
      const tail = Buffer.from('TAIL');
      const source = Readable.from(Buffer.from('BODY'));

      const stream = buildMultipartStream(head, source, tail);
      const reader = stream.getReader();
      const parts: string[] = [];
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) parts.push(Buffer.from(value).toString('utf8'));
      }

      const joined = parts.join('');
      expect(joined.startsWith('HEAD')).toBe(true);
      expect(joined.endsWith('TAIL')).toBe(true);
      expect(joined).toContain('BODY');
      const headIdx = joined.indexOf('HEAD');
      const bodyIdx = joined.indexOf('BODY');
      const tailIdx = joined.indexOf('TAIL');
      expect(headIdx).toBeLessThan(bodyIdx);
      expect(bodyIdx).toBeLessThan(tailIdx);
    });

    it('errors the ReadableStream when source errors', async () => {
      const source = new Readable({
        read() {
          this.destroy(new Error('upstream-fail'));
        },
      });
      const stream = buildMultipartStream(Buffer.alloc(0), source, Buffer.alloc(0));
      const reader = stream.getReader();

      await expect(
        (async () => {
          for (;;) {
            const { done } = await reader.read();
            if (done) break;
          }
        })()
      ).rejects.toThrow(/upstream-fail/);
    });
  });

  describe('sanitizeFilename', () => {
    it('replaces unsafe characters with underscores', () => {
      expect(sanitizeFilename('a"b\nc\\d\re.txt')).toBe('a_b_c_d_e.txt');
    });

    it('leaves safe characters intact', () => {
      expect(sanitizeFilename('file-name_1.txt')).toBe('file-name_1.txt');
    });
  });

  describe('getInfo', () => {
    it('retrieves file info', async () => {
      const mockFileInfo = {
        error: null,
        file_id: '12345678901234567890123456789012',
        filename: 'test.xml',
        size: 1024,
        created: '2026-01-01T00:00:00Z',
      };
      mockHttpClient.get.mockResolvedValue(mockFileInfo);

      const info = await filesAPI.getInfo('12345678901234567890123456789012');
      expect(info).toEqual(mockFileInfo);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/files/12345678901234567890123456789012/info');
    });

    it('throws for invalid file ID', async () => {
      await expect(filesAPI.getInfo('')).rejects.toThrow(ValidationError);
    });
  });

  describe('downloadTo', () => {
    it('downloads a file to path', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

      const mockWriteStream = {
        write: vi.fn(),
        end: vi.fn(),
        once: vi.fn(),
        on: vi.fn((event, cb) => {
          if (event === 'finish') setTimeout(() => cb(), 0);
          return mockWriteStream;
        }),
        emit: vi.fn(),
        writable: true,
      };
      vi.mocked(fs.createWriteStream).mockReturnValue(mockWriteStream as any);

      const mockResponse = new Response('test content', {
        headers: { 'content-disposition': 'attachment; filename="test.xml"' },
      });
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await filesAPI.downloadTo('12345678901234567890123456789012', './output.xml');

      expect(result).toBe('./output.xml');
      expect(mockHttpClient.get).toHaveBeenCalledWith('/files/12345678901234567890123456789012', { raw: true });
    });

    it('throws for invalid file ID', async () => {
      await expect(filesAPI.downloadTo('invalid_id')).rejects.toThrow(ValidationError);
    });

    it('accepts onProgress with content-length', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

      const mockWriteStream = {
        write: vi.fn(),
        end: vi.fn(),
        once: vi.fn(),
        on: vi.fn((event, cb) => {
          if (event === 'finish') setTimeout(() => cb(), 0);
          return mockWriteStream;
        }),
        emit: vi.fn(),
        writable: true,
      };
      vi.mocked(fs.createWriteStream).mockReturnValue(mockWriteStream as any);

      const events: any[] = [];
      const mockResponse = new Response('hello world', {
        headers: {
          'content-disposition': 'attachment; filename="out.csv"',
          'content-length': '11',
        },
      });
      mockHttpClient.get.mockResolvedValue(mockResponse);

      await filesAPI.downloadTo('12345678901234567890123456789012', './out.csv', (p) => events.push(p));

      expect(mockHttpClient.get).toHaveBeenCalled();
    });

    it('accepts onProgress without content-length', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

      const mockWriteStream = {
        write: vi.fn(),
        end: vi.fn(),
        once: vi.fn(),
        on: vi.fn((event, cb) => {
          if (event === 'finish') setTimeout(() => cb(), 0);
          return mockWriteStream;
        }),
        emit: vi.fn(),
        writable: true,
      };
      vi.mocked(fs.createWriteStream).mockReturnValue(mockWriteStream as any);

      const mockResponse = new Response('data', {
        headers: { 'content-disposition': 'attachment; filename="out.csv"' },
      });
      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(
        filesAPI.downloadTo('12345678901234567890123456789012', './out.csv', () => {})
      ).resolves.toBe('./out.csv');
    });
  });

  describe('downloadBuffer', () => {
    it('downloads a file as buffer', async () => {
      const mockBuffer = Buffer.from('test content');
      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(mockBuffer.buffer),
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await filesAPI.downloadBuffer('12345678901234567890123456789012');

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/files/12345678901234567890123456789012', { raw: true });
    });
  });
});
