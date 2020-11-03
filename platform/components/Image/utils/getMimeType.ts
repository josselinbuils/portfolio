const extensionMimeTypeMap = {
  apng: 'image/apng',
  bmp: 'image/bmp',
  cur: 'image/x-icon',
  gif: 'image/gif',
  ico: 'image/x-icon',
  jfif: 'image/jpeg',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pjp: 'image/jpeg',
  pjpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
} as { [extension: string]: ImageMimeType };

export function getMimeType(filename: string): ImageMimeType {
  const extension = filename
    .split('.')
    .pop() as keyof typeof extensionMimeTypeMap;
  const mimeType = extensionMimeTypeMap[extension];

  if (mimeType === undefined) {
    throw new Error(`Unknown image extension: ${extension}`);
  }
  return mimeType;
}

type ImageMimeType =
  | 'image/apng'
  | 'image/bmp'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/tiff'
  | 'image/x-icon'
  | 'image/webp';
