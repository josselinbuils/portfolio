import { Readable } from 'stream';
import tar from 'tar-stream';

export async function untar(tarBuffer: Buffer): Promise<Buffer[]> {
  return new Promise((resolve) => {
    const extract = tar.extract();
    const buffers = [] as Buffer[];

    extract.on('entry', (_, stream, next) => {
      const entryBuffers = [] as Buffer[];
      stream.on('data', (buffer) => entryBuffers.push(buffer));
      stream.on('end', () => {
        buffers.push(Buffer.concat(entryBuffers));
        next();
      });
      stream.resume();
    });

    extract.on('finish', () => resolve(buffers));

    Readable.from(tarBuffer).pipe(extract);
  });
}
