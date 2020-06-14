import { blobToBase64 } from './blobToBase64';

export async function createImage(svg: string): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    const image = new Image();
    const svgBlob = new Blob([svg], {
      type: 'image/svg+xml;charset=utf-8',
    });
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('Unable to generate image from svg'));
    image.src = await blobToBase64(svgBlob);
  });
}
