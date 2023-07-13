import { createImage } from './utils/createImage';
import { download } from './utils/download';
import { renderSVG } from './utils/renderSVG';

const FILENAME = 'snippet.jpg';
const SCALE = 2;

export async function exportAsImage(
  code: string,
  highlightedCode: string,
): Promise<void> {
  const { height, svg, width } = await renderSVG(code, highlightedCode, SCALE);
  const image = await createImage(svg);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('Unable to retrieve 2d context');
  }

  context.drawImage(image, 0, 0);
  download(FILENAME, canvas.toDataURL('image/png'));
}
