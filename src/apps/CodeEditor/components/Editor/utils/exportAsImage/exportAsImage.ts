import { convertSvg } from './utils/convertSvg';
import { download } from './utils/download';
import { renderSvg } from './utils/renderSvg';

const SCALE = 2;

export async function downloadAsPng(
  code: string,
  highlightedCode: string,
): Promise<void> {
  const svg = await renderSvg(code, highlightedCode, SCALE);
  const dataUrl = await convertSvg(svg, 'image/png');

  download('snippet.png', dataUrl);
}

export async function downloadAsSvg(
  code: string,
  highlightedCode: string,
): Promise<void> {
  const { dataUrl } = await renderSvg(code, highlightedCode, SCALE);

  download('snippet.svg', dataUrl);
}

export async function openAsPng(
  code: string,
  highlightedCode: string,
): Promise<void> {
  const svg = await renderSvg(code, highlightedCode, SCALE);
  const dataUrl = await convertSvg(svg, 'image/png');

  window
    .open()
    ?.document.write(
      `<iframe allowfullscreen src="${dataUrl}" style="border:0; height:100%; width:100%;"></iframe>`,
    );
}
