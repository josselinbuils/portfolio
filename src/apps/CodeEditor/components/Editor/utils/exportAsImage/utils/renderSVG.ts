import { blobToBase64 } from './blobToBase64';
import { getTextWidth } from './getTextWidth';

const BASE_FONT_SIZE_PX = 12;
const BORDER_RADIUS_PX = 6;
const LINE_HEIGHT = 1.25;
const PADDING_EM = 1;
const WOFF_FONT_URL =
  'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff/JetBrainsMono-Regular.woff';

export async function renderSVG(
  code: string,
  highlightedCode: string,
  scale: number
): Promise<{ height: number; svg: string; width: number }> {
  const font = await (await fetch(WOFF_FONT_URL)).blob();
  const base64Font = await blobToBase64(font);
  const borderRadius = BORDER_RADIUS_PX * scale;
  const fontSize = BASE_FONT_SIZE_PX * scale;
  const lines = code.trim().split('\n');
  const maxLengthLine = lines.reduce(
    (str, line) => (line.length > str.length ? line : str),
    ''
  );
  const maxLengthLineWidth = getTextWidth(
    maxLengthLine,
    `${BASE_FONT_SIZE_PX}px 'JetBrainsMono'`
  );
  const width = Math.ceil(
    (maxLengthLineWidth + PADDING_EM * BASE_FONT_SIZE_PX * 2) * scale
  );
  const height = Math.ceil(
    BASE_FONT_SIZE_PX * (LINE_HEIGHT * lines.length + PADDING_EM * 2) * scale
  );

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
        line-height: ${LINE_HEIGHT};
        white-space: pre-wrap;
        color: #a3b7c6;
        background: #2b2b2b;
        width: 100%;
        height: 100%;
        padding: 1em;
        box-sizing: border-box;
        border-radius: ${borderRadius}px;
      }

      .token.comment:not(.doc-comment) {
        color: #808080;
      }

      .token.keyword,
      .token.boolean,
      .token.constant,
      .token.null,
      .token.important,
      .token.rule {
        color: #cc7832;
      }

      .token.number {
        color: #6897bb;
      }

      .token.doctype,
      .token.function,
      .token.selector {
        color: #e8bf6a;
      }

      .token.tag {
        color: #e8bf6a;
      }

      .token.tag .attr-name {
        color: #a3b7c6;
      }

      .token.tag .attr-value {
        color: #a5c261;
      }

      .token.string,
      .token.regex,
      .token.char {
        color: #6a8759;
      }

      .token.doc-comment {
        color: #6a8759;
        font-style: italic;
       }

      .token.doc-comment .keyword {
        color: #6a8759;
        font-weight: bold;
        text-decoration: underline;
      }

      .token.doc-comment .parameter {
        color: #8a653b;
      }

      .token.annotation {
        color: #bbb529;
      }

      .token.constant {
        color: #9876aa;
      }

      .token.important {
        font-weight: bold;
      }

      .token.bold {
        font-weight: bold;
      }

      .token.italic {
        font-style: italic;
      }

      .token.entity {
        cursor: help;
      }
    </style>
  </defs>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${highlightedCode}</div>
  </foreignObject>
</svg>
`;

  return { height, svg, width };
}
