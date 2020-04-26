import { blobToBase64 } from './blobToBase64';
import { getTextWidth } from './getTextWidth';
import { stringifyPrismTheme } from './stringifyPrismTheme';

const BASE_FONT_SIZE_PX = 12;
const BORDER_RADIUS_PX = 6;
const LINE_HEIGHT = 1.25;
const PADDING_PX = 20;
const WOFF_FONT_URL =
  'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff/JetBrainsMono-Regular.woff';

export async function renderSVG(
  code: string,
  highlightedCode: string,
  scale: number
): Promise<{ height: number; svg: string; width: number }> {
  // Scales CSS properties
  const borderRadius = BORDER_RADIUS_PX * scale;
  const fontSize = BASE_FONT_SIZE_PX * scale;
  const lineHeight = fontSize * LINE_HEIGHT;
  const padding = PADDING_PX * scale;

  // Stringifies font
  const font = await (await fetch(WOFF_FONT_URL)).blob();
  const base64Font = await blobToBase64(font);

  // Stringifies Prism theme
  const prismTheme = stringifyPrismTheme(highlightedCode);

  // Computes dimensions
  const lines = code.trim().split('\n');
  const maxLengthLine = lines.reduce(
    (str, line) => (line.length > str.length ? line : str),
    ''
  );
  const maxLengthLineWidth = getTextWidth(
    maxLengthLine,
    `${fontSize}px 'JetBrainsMono'`
  );
  const width = maxLengthLineWidth + padding * 2;
  const height = Math.ceil(lineHeight * lines.length) + padding * 2;

  // Renders SVG
  const svg = `
<!--suppress ALL -->
<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px">
  <defs>
    <style>
      @font-face {
        font-family: 'JetBrainsMono';
        font-weight: 400;
        font-style: normal;
        src: url('${base64Font}') format('woff');
      }

      foreignObject {
        font-family: 'JetBrainsMono', monospace;
        font-size: ${fontSize}px;
        line-height: ${lineHeight}px;
        white-space: pre-wrap;
        color: #a3b7c6;
        background: #2b2b2b;
        width: 100%;
        height: 100%;
        padding: ${padding}px;
        box-sizing: border-box;
        border-radius: ${borderRadius}px;
      }

      ${prismTheme}
    </style>
  </defs>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${highlightedCode}</div>
  </foreignObject>
</svg>
`;

  return { height, svg, width };
}
