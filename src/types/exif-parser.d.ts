declare module 'exif-parser' {
  interface ExifResult {
    tags: {
      GPSLatitude?: number;
      GPSLongitude?: number;
      CreateDate?: number;
      DateTimeOriginal?: number;
      Model?: string;
      Make?: string;
      Software?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface Parser {
    parse(): ExifResult;
  }

  export default {
    create(buffer: Buffer): Parser;
  };
}
