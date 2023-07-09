import { type File } from '../interfaces/File';

// All sizes are in octets

const BLOCK_LENGTH = 512;
const FILE_SIZE_OFFSET = 124;
const FILE_SIZE_LENGTH = 12;
const FILE_TYPE_OFFSET = 156;
const FILE_TYPE_LENGTH = 1;
const FILENAME_OFFSET = 0;
const FILENAME_LENGTH = 100;
const HEADER_LENGTH = 512;
const NORMAL_FILE_TYPE = '0';

export function untar(buffer: ArrayBuffer): File[] {
  const files: File[] = [];
  let offset = 0;

  while (offset < buffer.byteLength - HEADER_LENGTH) {
    const type = readString(
      buffer,
      offset + FILE_TYPE_OFFSET,
      FILE_TYPE_LENGTH,
    );
    const size = parseInt(
      readString(buffer, offset + FILE_SIZE_OFFSET, FILE_SIZE_LENGTH),
      8,
    );

    if (type === NORMAL_FILE_TYPE) {
      const name = readString(
        buffer,
        offset + FILENAME_OFFSET,
        FILENAME_LENGTH,
      );
      const content = buffer.slice(
        offset + HEADER_LENGTH,
        offset + HEADER_LENGTH + size,
      );

      files.push({ name, content });
    }

    offset += HEADER_LENGTH + BLOCK_LENGTH * Math.ceil(size / BLOCK_LENGTH);
  }
  return files;
}

function readString(buffer: ArrayBuffer, offset: number, size: number): string {
  let array = new Uint8Array(buffer, offset, size);

  if (array.includes(0)) {
    array = array.slice(0, array.indexOf(0));
  }
  return new TextDecoder().decode(array);
}
