import { getTextWidth } from '../../../components/Editor/utils/getTextWidth';
import { blobToBase64 } from './blobToBase64';
import { stringifyPrismTheme } from './stringifyPrismTheme';

const BASE_FONT_SIZE_PX = 12;
const BORDER_RADIUS_PX = 6;
const CIRCLE_POSITION_PX = 15;
const CIRCLE_SPACING_PX = 7;
const LINE_HEIGHT = 1.5;
const PADDING_TOP_PX = 50;
const PADDING_RIGHT_PX = 20;
const PADDING_BOTTOM_PX = 17;
const PADDING_LEFT_PX = 20;
const WOFF_FONT_URL =
  'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff2/JetBrainsMono-Regular.woff2';

export interface RenderedSvg {
  dataUrl: string;
  height: number;
  svg: string;
  width: number;
}

export async function renderSvg(
  code: string,
  highlightedCode: string,
  scale: number,
): Promise<RenderedSvg> {
  // Scales CSS properties
  const borderRadius = BORDER_RADIUS_PX * scale;
  const fontSize = BASE_FONT_SIZE_PX * scale;
  const lineHeight = fontSize * LINE_HEIGHT;
  const paddingTop = PADDING_TOP_PX * scale;
  const paddingRight = PADDING_RIGHT_PX * scale;
  const paddingBottom = PADDING_BOTTOM_PX * scale;
  const paddingLeft = PADDING_LEFT_PX * scale;

  // Computes circle properties
  const circlePosition = CIRCLE_POSITION_PX * scale;
  const circleRadius = fontSize / 2;
  const circleOverallSpacing = fontSize + CIRCLE_SPACING_PX * scale;
  const circleY = circlePosition + circleRadius;
  const circleX0 = circlePosition + circleRadius;
  const circleX1 = circleX0 + circleOverallSpacing;
  const circleX2 = circleX1 + circleOverallSpacing;

  // Stringifies font
  const font = await (await fetch(WOFF_FONT_URL)).blob();
  const base64Font = await blobToBase64(font);

  // Cleans code
  const removeUselessSpaces = (str: string) =>
    str.replace(/^\s+/, '').replace(/\s+$/, '');
  code = removeUselessSpaces(code);
  highlightedCode = removeUselessSpaces(highlightedCode);

  // Stringifies Prism theme
  const prismTheme = stringifyPrismTheme(highlightedCode);

  // Computes dimensions
  const lines = code.split('\n');
  const maxLengthLine = lines.reduce(
    (str, line) => (line.length > str.length ? line : str),
    '',
  );
  const maxLengthLineWidth = getTextWidth(
    maxLengthLine,
    `${fontSize}px 'JetBrainsMono'`,
  );
  const width = maxLengthLineWidth + paddingLeft + paddingRight;
  const height =
    Math.ceil(lineHeight * lines.length) + paddingTop + paddingBottom;

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
        src: url('${base64Font}') format('woff2');
      }

      div {
        font-family: 'JetBrainsMono', monospace;
        font-size: ${fontSize}px;
        line-height: ${lineHeight}px;
        white-space: pre-wrap;
        color: #a3b7c6;
        background: #2b2b2b;
        padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;
        box-sizing: border-box;
        border-radius: ${borderRadius}px;
      }

      ${prismTheme}
    </style>
  </defs>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${highlightedCode}</div>
  </foreignObject>
  <circle cx="${circleX0}" cy="${circleY}" r="${circleRadius}" fill="#fa544d" />
  <circle cx="${circleX1}" cy="${circleY}" r="${circleRadius}" fill="#fbbd2e" />
  <circle cx="${circleX2}" cy="${circleY}" r="${circleRadius}" fill="#28c940" />
</svg>
`;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return { dataUrl, height, svg, width };
}
