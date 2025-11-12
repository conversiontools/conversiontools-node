/**
 * Auto-generated conversion types from Conversion Tools API
 *
 * This file contains type definitions for 100+ file conversion types
 * and their corresponding options.
 */

// ============================================================================
// Base Types
// ============================================================================

/** Base options available for ALL conversion types */
export interface BaseConversionOptions {
  /** Enable sandbox mode - unlimited testing without consuming quota */
  sandbox?: boolean;
  // Future: Add more common parameters here as API evolves
}

// ============================================================================
// Option Value Types
// ============================================================================

export type PageSize = 'A4' | 'B5' | 'Letter';

export type Delimiter = 'comma' | 'semicolon' | 'vertical_bar' | 'tabulation';

export type Orientation = 'Portrait' | 'Landscape';

export type ColorMode = 'colored' | 'grayscale';

export type ColorMode3 = 'colored' | 'grayscale' | 'monochrome';

export type BackgroundColor = 'white' | 'transparent';

export type ExcelFormat = 'xlsx' | 'xls';

export type Space = '0' | '1s' | '2s' | '3s' | '4s' | '1t';

export type XmlEncoding = 'utf-8' | 'utf-16le' | 'utf-16be';

export type Bitrate = 'default' | '96' | '128' | '160' | '192' | '256' | '320';

export type BitDepth = '8' | '16' | '24' | '32';

export type AudioChannels = 'default' | '1' | '2';

export type SamplingRate = 'default' | '8000' | '16000' | '44100' | '48000';

export type ImageResolution = '72' | '150' | '300' | '600';

export type PrefixAttr = '@' | '#' | '_' | '__';

export type PrefixText = '@' | '#' | '_' | '__';

export type InputEncoding =
  | 'auto'
  | 'utf-8'
  | 'utf-16le'
  | 'utf-16be'
  | 'iso-8859-1'
  | 'iso-8859-2'
  | 'iso-8859-3'
  | 'iso-8859-4'
  | 'iso-8859-5'
  | 'windows-1250'
  | 'windows-1251'
  | 'windows-1252'
  | string;

// ============================================================================
// Conversion-Specific Options
// ============================================================================

/** OCR: Convert PNG/JPG/PDF to Text/PDF */
export interface OcrOptions extends BaseConversionOptions {
  /** OCR language(s) - can be multiple separated by + (e.g., 'eng+spa') */
  language_ocr?: string;
}

/** Convert MP4/WAV/FLAC to MP3 */
export interface ToMp3Options extends BaseConversionOptions {
  /** Audio bitrate */
  bitrate?: Bitrate;
}

/** Convert MP3/FLAC to WAV */
export interface ToWavOptions extends BaseConversionOptions {
  /** Sampling rate in Hz */
  sampling_rate?: SamplingRate;
  /** Bit depth */
  bit_depth?: BitDepth;
  /** Audio channels */
  audio_channels?: AudioChannels;
}

/** Convert WAV to FLAC */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WavToFlacOptions extends BaseConversionOptions {
  // Only file_id, no additional options
}

/** Convert HTML/Website to PDF */
export interface WebsiteToPdfOptions extends BaseConversionOptions {
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OfficeConversionOptions extends BaseConversionOptions {
  // Only file_id, no additional options
}

/** Convert JPG/PNG to PDF */
export interface ImageToPdfOptions extends BaseConversionOptions {
  /** Page orientation */
  orientation?: Orientation;
}

/** Convert Markdown to PDF/HTML/ePUB */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MarkdownConversionOptions extends BaseConversionOptions {
  // Only file_id, no additional options
}

/** Convert Website/HTML to JPG/PNG */
export interface WebsiteToImageOptions extends BaseConversionOptions {
  /** URL (required for website conversions) */
  url: string;
  /** Load images */
  images?: boolean;
  /** Enable JavaScript */
  javascript?: boolean;
}

/** Convert HTML Table to CSV */
export interface HtmlTableToCsvOptions extends BaseConversionOptions {
  /** URL for online tables */
  url?: string;
  /** CSV delimiter */
  delimiter?: Delimiter;
}

/** Convert Excel to PDF */
export interface ExcelToPdfOptions extends BaseConversionOptions {
  /** Page orientation */
  orientation?: Orientation;
}

/** Convert Excel to HTML */
export interface ExcelToHtmlOptions extends BaseConversionOptions {
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
export interface ExcelToCsvOptions extends BaseConversionOptions {
  /** CSV delimiter */
  delimiter?: Delimiter;
  /** Quote all fields */
  quote?: boolean;
}

/** Convert Excel to ODS */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExcelToOdsOptions extends BaseConversionOptions {
  // Only file_id
}

/** Convert ODS to CSV */
export interface OdsToCsvOptions extends BaseConversionOptions {
  /** CSV delimiter */
  delimiter?: Delimiter;
}

/** Convert ODS to PDF */
export interface OdsToPdfOptions extends BaseConversionOptions {
  /** Page orientation */
  orientation?: Orientation;
}

/** Convert ODS to Excel */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OdsToExcelOptions extends BaseConversionOptions {
  // Only file_id
}

/** Convert CSV to Excel */
export interface CsvToExcelOptions extends BaseConversionOptions {
  /** CSV delimiter */
  delimiter?: Delimiter;
  /** Excel output format */
  excel_format?: ExcelFormat;
}

/** Convert CSV to XML */
export interface CsvToXmlOptions extends BaseConversionOptions {
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
export interface ExcelToXmlOptions extends BaseConversionOptions {
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
export interface XmlToJsonOptions extends BaseConversionOptions {
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
export interface XmlToCsvOptions extends BaseConversionOptions {
  /** CSV delimiter */
  delimiter?: Delimiter;
  /** Quote all fields */
  quote?: boolean;
}

/** Convert XML to Excel */
export interface XmlToExcelOptions extends BaseConversionOptions {
  /** Split large files into multiple Excel files when row limit reached */
  split_excel_rows_limit?: boolean;
  /** Excel output format */
  excel_format?: ExcelFormat;
}

/** Convert Excel XML to Excel XLSX */
export interface ExcelXmlToExcelXlsxOptions extends BaseConversionOptions {
  /** Excel output format */
  excel_format?: ExcelFormat;
}

/** Convert PDF to CSV */
export interface PdfToCsvOptions extends BaseConversionOptions {
  /** CSV delimiter */
  delimiter?: Delimiter;
  /** Quote all fields */
  quote?: boolean;
}

/** Convert PDF to Excel */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PdfToExcelOptions extends BaseConversionOptions {
  // Only file_id
}

/** Convert PDF to JPG */
export interface PdfToJpgOptions extends BaseConversionOptions {
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
export interface PdfToPngOptions extends BaseConversionOptions {
  /** Image resolution (PPI) */
  image_resolution?: ImageResolution;
  /** Color mode */
  colormode3?: ColorMode3;
  /** Background color */
  background_color?: BackgroundColor;
}

/** Convert PDF to SVG */
export interface PdfToSvgOptions extends BaseConversionOptions {
  /** Image resolution (PPI) */
  image_resolution?: ImageResolution;
  /** Page size */
  pagesize?: PageSize;
}

/** Convert PDF to HTML/Text */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PdfToTextOptions extends BaseConversionOptions {
  // Only file_id
}

/** Convert PNG to JPG or vice versa */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ImageConversionOptions extends BaseConversionOptions {
  // Only file_id
}

/** Convert HEIC to JPG */
export interface HeicToJpgOptions extends BaseConversionOptions {
  /** JPEG quality (0-100) */
  jpeg_quality?: number;
}

/** Convert PNG/JPG/TIFF/GIF to WebP */
export interface ToWebpOptions extends BaseConversionOptions {
  /** WebP quality (0-100) */
  webp_quality?: number;
}

/** Convert WebP to other formats */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WebpToImageOptions extends BaseConversionOptions {
  // Only file_id
}

/** Convert between eBook formats (ePUB, MOBI, AZW, etc.) */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EbookConversionOptions extends BaseConversionOptions {
  // Only file_id
}

/** Remove EXIF data from images */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RemoveExifOptions extends BaseConversionOptions {
  // Only file_id
}

/** Format JSON */
export interface FormatJsonOptions extends BaseConversionOptions {
  /** Indentation spacing */
  space?: Space;
}

/** Validate JSON */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ValidateJsonOptions extends BaseConversionOptions {
  // Only file_id - returns validation result
}

/** Convert JSON to XML */
export interface JsonToXmlOptions extends BaseConversionOptions {
  /** Indentation spacing for XML output */
  space?: Space;
}

/** Convert JSON to CSV */
export interface JsonToCsvOptions extends BaseConversionOptions {
  /** CSV delimiter */
  delimiter?: Delimiter;
  /** Quote all fields */
  quote?: boolean;
}

/** Convert JSON to Excel */
export interface JsonToExcelOptions extends BaseConversionOptions {
  /** Excel output format */
  excel_format?: ExcelFormat;
}

/** Convert JSON to YAML */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JsonToYamlOptions extends BaseConversionOptions {
  // Only file_id
}

/** Convert JSON objects to Excel */
export interface JsonObjectsToExcelOptions extends BaseConversionOptions {
  /** Excel output format */
  excel_format?: ExcelFormat;
}

/** Convert YAML to JSON */
export interface YamlToJsonOptions extends BaseConversionOptions {
  /** Indentation spacing */
  space?: Space;
}

/** Convert SRT to CSV */
export interface SrtToCsvOptions extends BaseConversionOptions {
  /** CSV delimiter */
  delimiter?: Delimiter;
  /** Quote all fields */
  quote?: boolean;
}

/** Convert SRT to Excel */
export interface SrtToExcelOptions extends BaseConversionOptions {
  /** Excel output format */
  excel_format?: ExcelFormat;
}

// ============================================================================
// Conversion Type to Options Map
// ============================================================================

export interface ConversionOptionsMap {
  // OCR conversions
  'convert.ocr_png_to_text': OcrOptions;
  'convert.ocr_jpg_to_text': OcrOptions;
  'convert.ocr_png_to_pdf': OcrOptions;
  'convert.ocr_jpg_to_pdf': OcrOptions;
  'convert.ocr_pdf_to_text': OcrOptions;
  'convert.ocr_pdf_to_pdf': OcrOptions;

  // Audio conversions
  'convert.mp4_to_mp3': ToMp3Options;
  'convert.wav_to_mp3': ToMp3Options;
  'convert.flac_to_mp3': ToMp3Options;
  'convert.mp3_to_wav': ToWavOptions;
  'convert.flac_to_wav': ToWavOptions;
  'convert.wav_to_flac': WavToFlacOptions;

  // Website/HTML to PDF
  'convert.website_to_pdf': WebsiteToPdfOptions;

  // Office to PDF
  'convert.word_to_pdf': OfficeConversionOptions;
  'convert.powerpoint_to_pdf': OfficeConversionOptions;
  'convert.oxps_to_pdf': OfficeConversionOptions;
  'convert.word_to_text': OfficeConversionOptions;
  'convert.powerpoint_to_text': OfficeConversionOptions;

  // Image to PDF
  'convert.jpg_to_pdf': ImageToPdfOptions;
  'convert.png_to_pdf': ImageToPdfOptions;

  // Markdown
  'convert.markdown_to_pdf': MarkdownConversionOptions;
  'convert.markdown_to_html': MarkdownConversionOptions;
  'convert.markdown_to_epub': MarkdownConversionOptions;

  // Website to Image
  'convert.website_to_jpg': WebsiteToImageOptions;
  'convert.html_to_jpg': WebsiteToImageOptions;
  'convert.website_to_png': WebsiteToImageOptions;
  'convert.html_to_png': WebsiteToImageOptions;

  // HTML table
  'convert.html_table_to_csv': HtmlTableToCsvOptions;

  // Excel conversions
  'convert.excel_to_pdf': ExcelToPdfOptions;
  'convert.excel_to_html': ExcelToHtmlOptions;
  'convert.excel_to_csv': ExcelToCsvOptions;
  'convert.excel_to_ods': ExcelToOdsOptions;
  'convert.excel_to_xml': ExcelToXmlOptions;
  'convert.excel_to_json': ExcelToXmlOptions;

  // ODS conversions
  'convert.ods_to_csv': OdsToCsvOptions;
  'convert.ods_to_pdf': OdsToPdfOptions;
  'convert.ods_to_excel': OdsToExcelOptions;

  // CSV conversions
  'convert.csv_to_excel': CsvToExcelOptions;
  'convert.csv_to_xml': CsvToXmlOptions;

  // XML conversions
  'convert.xml_to_json': XmlToJsonOptions;
  'convert.xml_to_csv': XmlToCsvOptions;
  'convert.xml_to_excel': XmlToExcelOptions;
  'convert.excel_xml_to_excel_xlsx': ExcelXmlToExcelXlsxOptions;

  // PDF conversions
  'convert.pdf_to_csv': PdfToCsvOptions;
  'convert.pdf_to_excel': PdfToExcelOptions;
  'convert.pdf_to_jpg': PdfToJpgOptions;
  'convert.pdf_to_png': PdfToPngOptions;
  'convert.pdf_to_tiff': PdfToPngOptions;
  'convert.pdf_to_svg': PdfToSvgOptions;
  'convert.pdf_to_html': PdfToTextOptions;
  'convert.pdf_to_text': PdfToTextOptions;
  'convert.pdf_to_word': PdfToTextOptions;

  // Image conversions
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

  // eBook conversions
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

  // Video conversions
  'convert.mov_to_mp4': BaseConversionOptions;
  'convert.mkv_to_mp4': BaseConversionOptions;
  'convert.avi_to_mp4': BaseConversionOptions;

  // Utilities
  'convert.remove_exif': RemoveExifOptions;
  'convert.format_json': FormatJsonOptions;
  'convert.validate_json': ValidateJsonOptions;
  'convert.fix_xml_escaping': BaseConversionOptions;

  // JSON conversions
  'convert.json_to_xml': JsonToXmlOptions;
  'convert.json_to_csv': JsonToCsvOptions;
  'convert.json_to_excel': JsonToExcelOptions;
  'convert.json_to_yaml': JsonToYamlOptions;
  'convert.json_objects_to_csv': JsonToCsvOptions;
  'convert.json_objects_to_excel': JsonObjectsToExcelOptions;

  // YAML
  'convert.yaml_to_json': YamlToJsonOptions;

  // SRT (subtitles)
  'convert.srt_to_csv': SrtToCsvOptions;
  'convert.srt_to_excel': SrtToExcelOptions;

  // Fallback for custom types
  [key: string]: BaseConversionOptions;
}

// ============================================================================
// Main Conversion Type
// ============================================================================

export type ConversionType = keyof ConversionOptionsMap | string;
