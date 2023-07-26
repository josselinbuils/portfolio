import { createImage } from './createImage';
import { type RenderedSvg } from './renderSvg';

export async function convertSvg(
  { dataUrl, height, width }: RenderedSvg,
  mimeType: string,
): Promise<string> {
  const image = await createImage(dataUrl);
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('Unable to retrieve 2d context');
  }
  context.drawImage(image, 0, 0);

  return canvas.toDataURL(mimeType);
}
