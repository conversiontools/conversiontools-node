/**
 * Auto-generated conversion types from Conversion Tools API
 *
 * This file contains type definitions for 100+ file conversion types
 * and their corresponding options.
 */
/** Base options available for ALL conversion types */
interface BaseConversionOptions {
    /** Enable sandbox mode - unlimited testing without consuming quota */
    sandbox?: boolean;
}
type PageSize = 'A4' | 'B5' | 'Letter';
type Delimiter = 'comma' | 'semicolon' | 'vertical_bar' | 'tabulation';
type Orientation = 'Portrait' | 'Landscape';
type ColorMode = 'colored' | 'grayscale';
type ColorMode3 = 'colored' | 'grayscale' | 'monochrome';
type BackgroundColor = 'white' | 'transparent';
type ExcelFormat = 'xlsx' | 'xls';
type Space = '0' | '1s' | '2s' | '3s' | '4s' | '1t';
type XmlEncoding = 'utf-8' | 'utf-16le' | 'utf-16be';
type Bitrate = 'default' | '96' | '128' | '160' | '192' | '256' | '320';
type BitDepth = '8' | '16' | '24' | '32';
type AudioChannels = 'default' | '1' | '2';
type SamplingRate = 'default' | '8000' | '16000' | '44100' | '48000';
type ImageResolution = '72' | '150' | '300' | '600';
type PrefixAttr = '@' | '#' | '_' | '__';
type PrefixText = '@' | '#' | '_' | '__';
type InputEncoding = 'auto' | 'utf-8' | 'utf-16le' | 'utf-16be' | 'iso-8859-1' | 'iso-8859-2' | 'iso-8859-3' | 'iso-8859-4' | 'iso-8859-5' | 'windows-1250' | 'windows-1251' | 'windows-1252' | string;
/** OCR: Convert PNG/JPG/PDF to Text/PDF */
interface OcrOptions extends BaseConversionOptions {
    /** OCR language(s) - can be multiple separated by + (e.g., 'eng+spa') */
    language_ocr?: string;
}
/** Convert MP4/WAV/FLAC to MP3 */
interface ToMp3Options extends BaseConversionOptions {
    /** Audio bitrate */
    bitrate?: Bitrate;
}
/** Convert MP3/FLAC to WAV */
interface ToWavOptions extends BaseConversionOptions {
    /** Sampling rate in Hz */
    sampling_rate?: SamplingRate;
    /** Bit depth */
    bit_depth?: BitDepth;
    /** Audio channels */
    audio_channels?: AudioChannels;
}
/** Convert WAV to FLAC */
interface WavToFlacOptions extends BaseConversionOptions {
}
/** Convert HTML/Website to PDF */
interface WebsiteToPdfOptions extends BaseConversionOptions {
    /** URL for website conversions (required if not uploading file) */
    url?: string;
    /** Page orientation */
    orientation?: Orientation;
    /** Page size */
    pagesize?: PageSize;
    /** Color mode */
    colormode?: ColorMode;
    /** Include page background */
    background?: boolean;
    /** Load images */
    images?: boolean;
    /** Enable JavaScript */
    javascript?: boolean;
}
/** Convert Word/PowerPoint to PDF/Text */
interface OfficeConversionOptions extends BaseConversionOptions {
}
/** Convert JPG/PNG to PDF */
interface ImageToPdfOptions extends BaseConversionOptions {
    /** Page orientation */
    orientation?: Orientation;
}
/** Convert Markdown to PDF/HTML/ePUB */
interface MarkdownConversionOptions extends BaseConversionOptions {
}
/** Convert Website/HTML to JPG/PNG */
interface WebsiteToImageOptions extends BaseConversionOptions {
    /** URL (required for website conversions) */
    url: string;
    /** Load images */
    images?: boolean;
    /** Enable JavaScript */
    javascript?: boolean;
}
/** Convert HTML Table to CSV */
interface HtmlTableToCsvOptions extends BaseConversionOptions {
    /** URL for online tables */
    url?: string;
    /** CSV delimiter */
    delimiter?: Delimiter;
}
/** Convert Excel to PDF */
interface ExcelToPdfOptions extends BaseConversionOptions {
    /** Page orientation */
    orientation?: Orientation;
}
/** Convert Excel to HTML */
interface ExcelToHtmlOptions extends BaseConversionOptions {
    /** Re-calculate formulas before conversion */
    recalculate?: boolean;
    /** Make table columns sortable */
    make_sortable?: boolean;
    /** Title for overview page */
    title_overview?: string;
    /** Title for sheet pages */
    title_sheet?: string;
}
/** Convert Excel to CSV */
interface ExcelToCsvOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
    /** Quote all fields */
    quote?: boolean;
}
/** Convert Excel to ODS */
interface ExcelToOdsOptions extends BaseConversionOptions {
}
/** Convert ODS to CSV */
interface OdsToCsvOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
}
/** Convert ODS to PDF */
interface OdsToPdfOptions extends BaseConversionOptions {
    /** Page orientation */
    orientation?: Orientation;
}
/** Convert ODS to Excel */
interface OdsToExcelOptions extends BaseConversionOptions {
}
/** Convert CSV to Excel */
interface CsvToExcelOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
    /** Excel output format */
    excel_format?: ExcelFormat;
}
/** Convert CSV to XML */
interface CsvToXmlOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
    /** First row is header */
    header?: boolean;
    /** Show columns section */
    show_columns?: boolean;
    /** Add index to records */
    index_records?: boolean;
    /** Add empty nodes */
    add_empty_nodes?: boolean;
    /** Use short tag for empty nodes */
    short_tag_empty_node?: boolean;
    /** XML encoding */
    xml_encoding?: XmlEncoding;
}
/** Convert Excel to XML */
interface ExcelToXmlOptions extends BaseConversionOptions {
    /** First row is header */
    header?: boolean;
    /** Show columns section */
    show_columns?: boolean;
    /** Add index to records */
    index_records?: boolean;
    /** Add empty nodes */
    add_empty_nodes?: boolean;
    /** Use short tag for empty nodes */
    short_tag_empty_node?: boolean;
    /** XML encoding */
    xml_encoding?: XmlEncoding;
}
/** Convert XML to JSON */
interface XmlToJsonOptions extends BaseConversionOptions {
    /** Indentation spacing */
    space?: Space;
    /** Attribute prefix */
    prefix_attr?: PrefixAttr;
    /** Text node prefix */
    prefix_text?: PrefixText;
    /** Always create object for attributes */
    attr_always_object?: boolean;
    /** Always create object for text nodes */
    text_always_object?: boolean;
}
/** Convert XML to CSV */
interface XmlToCsvOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
    /** Quote all fields */
    quote?: boolean;
}
/** Convert XML to Excel */
interface XmlToExcelOptions extends BaseConversionOptions {
    /** Split large files into multiple Excel files when row limit reached */
    split_excel_rows_limit?: boolean;
    /** Excel output format */
    excel_format?: ExcelFormat;
}
/** Convert Excel XML to Excel XLSX */
interface ExcelXmlToExcelXlsxOptions extends BaseConversionOptions {
    /** Excel output format */
    excel_format?: ExcelFormat;
}
/** Convert PDF to CSV */
interface PdfToCsvOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
    /** Quote all fields */
    quote?: boolean;
}
/** Convert PDF to Excel */
interface PdfToExcelOptions extends BaseConversionOptions {
}
/** Convert PDF to JPG */
interface PdfToJpgOptions extends BaseConversionOptions {
    /** Image resolution (PPI) */
    image_resolution?: ImageResolution;
    /** JPEG quality (0-100) */
    jpeg_quality?: number;
    /** Color mode */
    colormode?: ColorMode;
    /** Create progressive JPEG */
    progressive_jpeg?: boolean;
}
/** Convert PDF to PNG/TIFF */
interface PdfToPngOptions extends BaseConversionOptions {
    /** Image resolution (PPI) */
    image_resolution?: ImageResolution;
    /** Color mode */
    colormode3?: ColorMode3;
    /** Background color */
    background_color?: BackgroundColor;
}
/** Convert PDF to SVG */
interface PdfToSvgOptions extends BaseConversionOptions {
    /** Image resolution (PPI) */
    image_resolution?: ImageResolution;
    /** Page size */
    pagesize?: PageSize;
}
/** Convert PDF to HTML/Text */
interface PdfToTextOptions extends BaseConversionOptions {
}
/** Convert PNG to JPG or vice versa */
interface ImageConversionOptions extends BaseConversionOptions {
}
/** Convert HEIC to JPG */
interface HeicToJpgOptions extends BaseConversionOptions {
    /** JPEG quality (0-100) */
    jpeg_quality?: number;
}
/** Convert PNG/JPG/TIFF/GIF to WebP */
interface ToWebpOptions extends BaseConversionOptions {
    /** WebP quality (0-100) */
    webp_quality?: number;
}
/** Convert WebP to other formats */
interface WebpToImageOptions extends BaseConversionOptions {
}
/** Convert between eBook formats (ePUB, MOBI, AZW, etc.) */
interface EbookConversionOptions extends BaseConversionOptions {
}
/** Remove EXIF data from images */
interface RemoveExifOptions extends BaseConversionOptions {
}
/** Format JSON */
interface FormatJsonOptions extends BaseConversionOptions {
    /** Indentation spacing */
    space?: Space;
}
/** Validate JSON */
interface ValidateJsonOptions extends BaseConversionOptions {
}
/** Convert JSON to XML */
interface JsonToXmlOptions extends BaseConversionOptions {
    /** Indentation spacing for XML output */
    space?: Space;
}
/** Convert JSON to CSV */
interface JsonToCsvOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
    /** Quote all fields */
    quote?: boolean;
}
/** Convert JSON to Excel */
interface JsonToExcelOptions extends BaseConversionOptions {
    /** Excel output format */
    excel_format?: ExcelFormat;
}
/** Convert JSON to YAML */
interface JsonToYamlOptions extends BaseConversionOptions {
}
/** Convert JSON objects to Excel */
interface JsonObjectsToExcelOptions extends BaseConversionOptions {
    /** Excel output format */
    excel_format?: ExcelFormat;
}
/** Convert YAML to JSON */
interface YamlToJsonOptions extends BaseConversionOptions {
    /** Indentation spacing */
    space?: Space;
}
/** Convert SRT to CSV */
interface SrtToCsvOptions extends BaseConversionOptions {
    /** CSV delimiter */
    delimiter?: Delimiter;
    /** Quote all fields */
    quote?: boolean;
}
/** Convert SRT to Excel */
interface SrtToExcelOptions extends BaseConversionOptions {
    /** Excel output format */
    excel_format?: ExcelFormat;
}
interface ConversionOptionsMap {
    'convert.ocr_png_to_text': OcrOptions;
    'convert.ocr_jpg_to_text': OcrOptions;
    'convert.ocr_png_to_pdf': OcrOptions;
    'convert.ocr_jpg_to_pdf': OcrOptions;
    'convert.ocr_pdf_to_text': OcrOptions;
    'convert.ocr_pdf_to_pdf': OcrOptions;
    'convert.mp4_to_mp3': ToMp3Options;
    'convert.wav_to_mp3': ToMp3Options;
    'convert.flac_to_mp3': ToMp3Options;
    'convert.mp3_to_wav': ToWavOptions;
    'convert.flac_to_wav': ToWavOptions;
    'convert.wav_to_flac': WavToFlacOptions;
    'convert.website_to_pdf': WebsiteToPdfOptions;
    'convert.word_to_pdf': OfficeConversionOptions;
    'convert.powerpoint_to_pdf': OfficeConversionOptions;
    'convert.oxps_to_pdf': OfficeConversionOptions;
    'convert.word_to_text': OfficeConversionOptions;
    'convert.powerpoint_to_text': OfficeConversionOptions;
    'convert.jpg_to_pdf': ImageToPdfOptions;
    'convert.png_to_pdf': ImageToPdfOptions;
    'convert.markdown_to_pdf': MarkdownConversionOptions;
    'convert.markdown_to_html': MarkdownConversionOptions;
    'convert.markdown_to_epub': MarkdownConversionOptions;
    'convert.website_to_jpg': WebsiteToImageOptions;
    'convert.html_to_jpg': WebsiteToImageOptions;
    'convert.website_to_png': WebsiteToImageOptions;
    'convert.html_to_png': WebsiteToImageOptions;
    'convert.html_table_to_csv': HtmlTableToCsvOptions;
    'convert.excel_to_pdf': ExcelToPdfOptions;
    'convert.excel_to_html': ExcelToHtmlOptions;
    'convert.excel_to_csv': ExcelToCsvOptions;
    'convert.excel_to_ods': ExcelToOdsOptions;
    'convert.excel_to_xml': ExcelToXmlOptions;
    'convert.excel_to_json': ExcelToXmlOptions;
    'convert.ods_to_csv': OdsToCsvOptions;
    'convert.ods_to_pdf': OdsToPdfOptions;
    'convert.ods_to_excel': OdsToExcelOptions;
    'convert.csv_to_excel': CsvToExcelOptions;
    'convert.csv_to_xml': CsvToXmlOptions;
    'convert.xml_to_json': XmlToJsonOptions;
    'convert.xml_to_csv': XmlToCsvOptions;
    'convert.xml_to_excel': XmlToExcelOptions;
    'convert.excel_xml_to_excel_xlsx': ExcelXmlToExcelXlsxOptions;
    'convert.pdf_to_csv': PdfToCsvOptions;
    'convert.pdf_to_excel': PdfToExcelOptions;
    'convert.pdf_to_jpg': PdfToJpgOptions;
    'convert.pdf_to_png': PdfToPngOptions;
    'convert.pdf_to_tiff': PdfToPngOptions;
    'convert.pdf_to_svg': PdfToSvgOptions;
    'convert.pdf_to_html': PdfToTextOptions;
    'convert.pdf_to_text': PdfToTextOptions;
    'convert.pdf_to_word': PdfToTextOptions;
    'convert.png_to_jpg': ImageConversionOptions;
    'convert.jpg_to_png': ImageConversionOptions;
    'convert.heic_to_png': ImageConversionOptions;
    'convert.heic_to_jpg': HeicToJpgOptions;
    'convert.png_to_webp': ToWebpOptions;
    'convert.jpg_to_webp': ToWebpOptions;
    'convert.tiff_to_webp': ToWebpOptions;
    'convert.gif_to_webp': ToWebpOptions;
    'convert.webp_to_png': WebpToImageOptions;
    'convert.webp_to_tiff': WebpToImageOptions;
    'convert.webp_to_bmp': WebpToImageOptions;
    'convert.webp_to_yuv': WebpToImageOptions;
    'convert.webp_to_pam': WebpToImageOptions;
    'convert.webp_to_pgm': WebpToImageOptions;
    'convert.webp_to_ppm': WebpToImageOptions;
    'convert.png_to_svg': PdfToSvgOptions;
    'convert.jpg_to_avif': ToWebpOptions;
    'convert.png_to_avif': ToWebpOptions;
    'convert.avif_to_png': WebpToImageOptions;
    'convert.avif_to_jpg': WebpToImageOptions;
    'convert.epub_to_mobi': EbookConversionOptions;
    'convert.epub_to_azw': EbookConversionOptions;
    'convert.mobi_to_epub': EbookConversionOptions;
    'convert.mobi_to_azw': EbookConversionOptions;
    'convert.azw_to_epub': EbookConversionOptions;
    'convert.azw_to_mobi': EbookConversionOptions;
    'convert.epub_to_pdf': EbookConversionOptions;
    'convert.mobi_to_pdf': EbookConversionOptions;
    'convert.azw_to_pdf': EbookConversionOptions;
    'convert.azw3_to_pdf': EbookConversionOptions;
    'convert.fb2_to_pdf': EbookConversionOptions;
    'convert.fbz_to_pdf': EbookConversionOptions;
    'convert.pdf_to_epub': EbookConversionOptions;
    'convert.pdf_to_mobi': EbookConversionOptions;
    'convert.pdf_to_azw': EbookConversionOptions;
    'convert.pdf_to_azw3': EbookConversionOptions;
    'convert.pdf_to_fb2': EbookConversionOptions;
    'convert.pdf_to_fbz': EbookConversionOptions;
    'convert.mov_to_mp4': BaseConversionOptions;
    'convert.mkv_to_mp4': BaseConversionOptions;
    'convert.avi_to_mp4': BaseConversionOptions;
    'convert.remove_exif': RemoveExifOptions;
    'convert.format_json': FormatJsonOptions;
    'convert.validate_json': ValidateJsonOptions;
    'convert.fix_xml_escaping': BaseConversionOptions;
    'convert.json_to_xml': JsonToXmlOptions;
    'convert.json_to_csv': JsonToCsvOptions;
    'convert.json_to_excel': JsonToExcelOptions;
    'convert.json_to_yaml': JsonToYamlOptions;
    'convert.json_objects_to_csv': JsonToCsvOptions;
    'convert.json_objects_to_excel': JsonObjectsToExcelOptions;
    'convert.yaml_to_json': YamlToJsonOptions;
    'convert.srt_to_csv': SrtToCsvOptions;
    'convert.srt_to_excel': SrtToExcelOptions;
    [key: string]: BaseConversionOptions;
}
type ConversionType = keyof ConversionOptionsMap | string;

/**
 * Configuration for ConversionToolsClient
 */
interface ConversionToolsConfig {
    /** API token from https://conversiontools.io/profile */
    apiToken: string;
    /** Base URL for API (default: https://api.conversiontools.io/v1) */
    baseURL?: string;
    /** Request timeout in milliseconds (default: 300000 / 5 minutes) */
    timeout?: number;
    /** Number of retry attempts for failed requests (default: 3) */
    retries?: number;
    /** Initial delay between retries in milliseconds (default: 1000) */
    retryDelay?: number;
    /** HTTP status codes that should trigger retry (default: [408, 500, 502, 503, 504]) */
    retryableStatuses?: number[];
    /** Polling interval in milliseconds (default: 5000 / 5 seconds) */
    pollingInterval?: number;
    /** Maximum polling interval in milliseconds (default: 30000 / 30 seconds) */
    maxPollingInterval?: number;
    /** Polling backoff multiplier (default: 1.5) */
    pollingBackoff?: number;
    /** Webhook URL for task completion notifications */
    webhookUrl?: string;
    /** UserAgent string for HTTP requests */
    userAgent?: string;
    /** Upload progress callback */
    onUploadProgress?: (progress: ProgressEvent) => void;
    /** Download progress callback */
    onDownloadProgress?: (progress: ProgressEvent) => void;
    /** Conversion progress callback */
    onConversionProgress?: (progress: ConversionProgressEvent) => void;
}
/**
 * Progress event for uploads/downloads
 */
interface ProgressEvent {
    /** Bytes loaded */
    loaded: number;
    /** Total bytes (if known) */
    total?: number;
    /** Percentage complete (0-100) */
    percent?: number;
}
/**
 * Progress event for conversion tasks
 */
interface ConversionProgressEvent extends ProgressEvent {
    /** Task status */
    status: TaskStatus;
    /** Task ID */
    taskId: string;
}
/**
 * Input types for conversion
 */
type ConversionInput = string | {
    path: string;
} | {
    url: string;
} | {
    stream: NodeJS.ReadableStream;
} | {
    buffer: Buffer;
    filename?: string;
} | {
    fileId: string;
};
/**
 * Options for convert() method
 */
interface ConvertOptions<T extends ConversionType = ConversionType> {
    /** Conversion type (e.g., 'convert.xml_to_excel') */
    type: T;
    /** Input file/URL/stream/buffer */
    input: ConversionInput;
    /** Output file path (optional, defaults to current directory) */
    output?: string;
    /** Conversion-specific options */
    options?: T extends keyof ConversionOptionsMap ? ConversionOptionsMap[T] : Record<string, any>;
    /** Wait for completion (default: true) */
    wait?: boolean;
    /** Webhook URL for this specific task */
    callbackUrl?: string;
    /** Custom polling configuration */
    polling?: {
        interval?: number;
        maxInterval?: number;
        backoff?: number;
    };
}
/**
 * Task status values
 */
type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR';
/**
 * Options for task.wait()
 */
interface WaitOptions {
    /** Polling interval in milliseconds */
    pollingInterval?: number;
    /** Maximum polling interval in milliseconds */
    maxPollingInterval?: number;
    /** Maximum wait time in milliseconds (0 = no limit) */
    timeout?: number;
    /** Progress callback */
    onProgress?: (status: TaskStatusResponse) => void;
}
/**
 * Task status response from API
 */
interface TaskStatusResponse {
    error: string | null;
    status: TaskStatus;
    file_id: string | null;
    conversionProgress: number;
}
/**
 * Task creation request
 */
interface TaskCreateRequest {
    type: string;
    options: {
        file_id?: string;
        url?: string;
        sandbox?: boolean;
        [key: string]: any;
    };
    callbackUrl?: string;
}
/**
 * Task creation response
 */
interface TaskCreateResponse {
    error: string | null;
    task_id: string;
    sandbox?: boolean;
    message?: string;
}
/**
 * File upload response
 */
interface FileUploadResponse {
    error: string | null;
    file_id: string;
}
/**
 * File info response
 */
interface FileInfo {
    preview: boolean;
    size: number;
    name: string;
    previewData?: string[];
}
/**
 * Rate limits from response headers
 */
interface RateLimits {
    daily?: {
        limit: number;
        remaining: number;
    };
    monthly?: {
        limit: number;
        remaining: number;
    };
    fileSize?: number;
}
/**
 * File upload options
 */
interface FileUploadOptions {
    /** Upload progress callback */
    onProgress?: (progress: ProgressEvent) => void;
}
/**
 * User info response
 */
interface UserInfo {
    error: string | null;
    email: string;
}

/**
 * HTTP client with retry logic for Conversion Tools API
 */

interface HttpClientConfig {
    apiToken: string;
    baseURL?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    retryableStatuses?: number[];
    userAgent?: string;
}
interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
    raw?: boolean;
    signal?: AbortSignal;
}
declare class HttpClient {
    private readonly config;
    private lastRateLimits?;
    constructor(config: HttpClientConfig);
    /**
     * Get the last rate limits from API response headers
     */
    getRateLimits(): RateLimits | undefined;
    /**
     * Make an HTTP request with retry logic
     */
    request<T = any>(options: RequestOptions): Promise<T>;
    /**
     * Extract rate limits from response headers
     */
    private extractRateLimits;
    /**
     * Handle error responses
     */
    private handleErrorResponse;
    /**
     * Make a GET request
     */
    get<T = any>(path: string, options?: Partial<RequestOptions>): Promise<T>;
    /**
     * Make a POST request
     */
    post<T = any>(path: string, body?: any, options?: Partial<RequestOptions>): Promise<T>;
}

/**
 * Config API - Get API configuration and user info
 */

interface ConversionConfig {
    type: string;
    title: string;
    options: string[];
}
interface ApiConfig {
    error: string | null;
    conversions: ConversionConfig[];
}

/**
 * Files API - Upload, download, and manage files
 */

declare class FilesAPI {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Upload a file from various sources
     */
    upload(input: string | NodeJS.ReadableStream | Buffer, options?: FileUploadOptions): Promise<string>;
    /**
     * Get file metadata
     */
    getInfo(fileId: string): Promise<FileInfo>;
    /**
     * Download file as stream
     */
    downloadStream(fileId: string): Promise<NodeJS.ReadableStream>;
    /**
     * Download file as buffer
     */
    downloadBuffer(fileId: string): Promise<Buffer>;
    /**
     * Download file to path
     */
    downloadTo(fileId: string, outputPath?: string): Promise<string>;
}

/**
 * Tasks API - Create and manage conversion tasks
 */

interface TaskListOptions {
    status?: TaskStatus;
}
interface TaskDetail {
    id: string;
    type: string;
    status: TaskStatus;
    error: string | null;
    url: string | null;
    dateCreated: string;
    dateFinished: string | null;
    conversionProgress: number;
    fileSource?: {
        id: string;
        name: string;
        size: number;
        exists: boolean;
    };
    fileResult?: {
        id: string;
        name: string;
        size: number;
        exists: boolean;
    };
}
declare class TasksAPI {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Create a new conversion task
     */
    create(request: TaskCreateRequest): Promise<TaskCreateResponse>;
    /**
     * Get task status
     */
    getStatus(taskId: string): Promise<TaskStatusResponse>;
    /**
     * List all tasks (optionally filtered by status)
     */
    list(options?: TaskListOptions): Promise<TaskDetail[]>;
}

/**
 * Task model - High-level interface for conversion tasks
 */

interface TaskOptions {
    /** Task ID */
    id: string;
    /** Conversion type */
    type: string;
    /** Initial status (optional) */
    status?: TaskStatus;
    /** File ID (result file, if completed) */
    fileId?: string | null;
    /** Error message (if failed) */
    error?: string | null;
    /** Conversion progress (0-100) */
    conversionProgress?: number;
    /** Default polling configuration */
    defaultPolling?: {
        interval: number;
        maxInterval: number;
        backoff: number;
    };
}
declare class Task {
    readonly id: string;
    readonly type: string;
    private _status;
    private _fileId;
    private _error;
    private _conversionProgress;
    private readonly tasksAPI;
    private readonly filesAPI;
    private readonly defaultPolling;
    constructor(options: TaskOptions, tasksAPI: TasksAPI, filesAPI: FilesAPI);
    /**
     * Get current status
     */
    get status(): TaskStatus;
    /**
     * Get result file ID
     */
    get fileId(): string | null;
    /**
     * Get error message
     */
    get error(): string | null;
    /**
     * Get conversion progress (0-100)
     */
    get conversionProgress(): number;
    /**
     * Check if task is complete (success or error)
     */
    get isComplete(): boolean;
    /**
     * Check if task succeeded
     */
    get isSuccess(): boolean;
    /**
     * Check if task failed
     */
    get isError(): boolean;
    /**
     * Check if task is still running
     */
    get isRunning(): boolean;
    /**
     * Refresh task status from API
     */
    refresh(): Promise<void>;
    /**
     * Get task status (alias for refresh)
     */
    getStatus(): Promise<TaskStatusResponse>;
    /**
     * Wait for task to complete
     */
    wait(options?: WaitOptions): Promise<void>;
    /**
     * Download result file as stream
     */
    downloadStream(): Promise<NodeJS.ReadableStream>;
    /**
     * Download result file as buffer
     */
    downloadBuffer(): Promise<Buffer>;
    /**
     * Download result file to path
     */
    downloadTo(outputPath?: string): Promise<string>;
    /**
     * Update task state from API response
     */
    private updateFromResponse;
    /**
     * Convert to JSON
     */
    toJSON(): {
        id: string;
        type: string;
        status: TaskStatus;
        fileId: string | null;
        error: string | null;
        conversionProgress: number;
    };
}

declare class ConversionToolsClient {
    private readonly config;
    private readonly http;
    /** Files API */
    readonly files: FilesAPI;
    /** Tasks API */
    readonly tasks: TasksAPI;
    private readonly configAPI;
    constructor(config: ConversionToolsConfig);
    /**
     * Simple conversion method - upload, convert, wait, and download in one call
     */
    convert<T extends ConversionType>(options: ConvertOptions<T>): Promise<string>;
    /**
     * Create a conversion task (low-level API)
     */
    createTask(request: {
        type: string;
        options: Record<string, any>;
        callbackUrl?: string;
    }): Promise<Task>;
    /**
     * Get an existing task by ID
     */
    getTask(taskId: string): Promise<Task>;
    /**
     * Get rate limits from last API call
     */
    getRateLimits(): RateLimits | undefined;
    /**
     * Get authenticated user information
     */
    getUser(): Promise<UserInfo>;
    /**
     * Get API configuration (available conversion types)
     */
    getConfig(): Promise<ApiConfig>;
}

/**
 * Base error class for all Conversion Tools API errors
 */
declare class ConversionToolsError extends Error {
    readonly code: string;
    readonly status?: number | undefined;
    readonly response?: any | undefined;
    constructor(message: string, code: string, status?: number | undefined, response?: any | undefined);
}
/**
 * Authentication error - Invalid or missing API token
 */
declare class AuthenticationError extends ConversionToolsError {
    constructor(message?: string);
}
/**
 * Validation error - Invalid request parameters
 */
declare class ValidationError extends ConversionToolsError {
    constructor(message: string, response?: any);
}
/**
 * Rate limit error - Quota exceeded
 */
declare class RateLimitError extends ConversionToolsError {
    readonly limits?: {
        daily?: {
            limit: number;
            remaining: number;
        };
        monthly?: {
            limit: number;
            remaining: number;
        };
    } | undefined;
    constructor(message: string, limits?: {
        daily?: {
            limit: number;
            remaining: number;
        };
        monthly?: {
            limit: number;
            remaining: number;
        };
    } | undefined);
}
/**
 * File not found error
 */
declare class FileNotFoundError extends ConversionToolsError {
    readonly fileId?: string | undefined;
    constructor(message?: string, fileId?: string | undefined);
}
/**
 * Task not found error
 */
declare class TaskNotFoundError extends ConversionToolsError {
    readonly taskId?: string | undefined;
    constructor(message?: string, taskId?: string | undefined);
}
/**
 * Conversion error - Task failed during conversion
 */
declare class ConversionError extends ConversionToolsError {
    readonly taskId?: string | undefined;
    readonly taskError?: string | undefined;
    constructor(message: string, taskId?: string | undefined, taskError?: string | undefined);
}
/**
 * Timeout error - Request or operation timed out
 */
declare class TimeoutError extends ConversionToolsError {
    readonly timeout?: number | undefined;
    constructor(message?: string, timeout?: number | undefined);
}
/**
 * Network error - Connection issues
 */
declare class NetworkError extends ConversionToolsError {
    readonly originalError?: Error | undefined;
    constructor(message: string, originalError?: Error | undefined);
}

export { type AudioChannels, AuthenticationError, type BackgroundColor, type BaseConversionOptions, type BitDepth, type Bitrate, type ColorMode, type ColorMode3, ConversionError, type ConversionInput, type ConversionOptionsMap, type ConversionProgressEvent, ConversionToolsClient, type ConversionToolsConfig, ConversionToolsError, type ConversionType, type ConvertOptions, type CsvToExcelOptions, type CsvToXmlOptions, type Delimiter, type EbookConversionOptions, type ExcelFormat, type ExcelToCsvOptions, type ExcelToHtmlOptions, type ExcelToOdsOptions, type ExcelToPdfOptions, type ExcelToXmlOptions, type ExcelXmlToExcelXlsxOptions, type FileInfo, FileNotFoundError, type FileUploadOptions, type FileUploadResponse, type FormatJsonOptions, type HeicToJpgOptions, type HtmlTableToCsvOptions, type ImageConversionOptions, type ImageResolution, type ImageToPdfOptions, type InputEncoding, type JsonObjectsToExcelOptions, type JsonToCsvOptions, type JsonToExcelOptions, type JsonToXmlOptions, type JsonToYamlOptions, type MarkdownConversionOptions, NetworkError, type OcrOptions, type OdsToCsvOptions, type OdsToExcelOptions, type OdsToPdfOptions, type OfficeConversionOptions, type Orientation, type PageSize, type PdfToCsvOptions, type PdfToExcelOptions, type PdfToJpgOptions, type PdfToPngOptions, type PdfToSvgOptions, type PdfToTextOptions, type PrefixAttr, type PrefixText, type ProgressEvent, RateLimitError, type RateLimits, type RemoveExifOptions, type SamplingRate, type Space, type SrtToCsvOptions, type SrtToExcelOptions, Task, type TaskCreateRequest, type TaskCreateResponse, TaskNotFoundError, type TaskStatus, type TaskStatusResponse, TimeoutError, type ToMp3Options, type ToWavOptions, type ToWebpOptions, type UserInfo, type ValidateJsonOptions, ValidationError, type WaitOptions, type WavToFlacOptions, type WebpToImageOptions, type WebsiteToImageOptions, type WebsiteToPdfOptions, type XmlEncoding, type XmlToCsvOptions, type XmlToExcelOptions, type XmlToJsonOptions, type YamlToJsonOptions };
