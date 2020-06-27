import { Position } from '~/platform/interfaces/Position';

const properties = [
  'direction',
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'MozTabSize',
];

// Based on https://github.com/component/textarea-caret-position
export function getOffsetPosition(
  element: HTMLTextAreaElement,
  cursorOffset: number
): Position<number> {
  const isBrowser = typeof window !== 'undefined';
  const isFirefox = isBrowser && (window as any).mozInnerScreenX !== null;

  if (!isBrowser) {
    throw new Error(
      'textarea-caret-position#getCaretCoordinates should only be called in a browser'
    );
  }

  const div = document.createElement('div');
  div.id = 'input-textarea-caret-position-mirror-div';
  document.body.appendChild(div);

  const style = div.style;
  const computed = window.getComputedStyle
    ? window.getComputedStyle(element)
    : (element as any).currentStyle;
  const isInput = element.nodeName === 'INPUT';

  style.whiteSpace = 'pre-wrap';
  if (!isInput) {
    style.wordWrap = 'break-word';
  }

  style.position = 'absolute';
  style.visibility = 'hidden';

  properties.forEach((prop) => {
    if (isInput && prop === 'lineHeight') {
      if (computed.boxSizing === 'border-box') {
        const height = parseInt(computed.height, 10);
        const outerHeight =
          parseInt(computed.paddingTop, 10) +
          parseInt(computed.paddingBottom, 10) +
          parseInt(computed.borderTopWidth, 10) +
          parseInt(computed.borderBottomWidth, 10);

        const targetHeight = outerHeight + parseInt(computed.lineHeight, 10);

        // tslint:disable-next-line:prefer-conditional-expression
        if (height > targetHeight) {
          style.lineHeight = `${height - outerHeight}px`;
        } else if (height === targetHeight) {
          style.lineHeight = computed.lineHeight;
        } else {
          style.lineHeight = '0';
        }
      } else {
        style.lineHeight = computed.height;
      }
    } else {
      (style as any)[prop] = computed[prop];
    }
  });

  if (isFirefox) {
    if (element.scrollHeight > parseInt(computed.height, 10)) {
      style.overflowY = 'scroll';
    }
  } else {
    style.overflow = 'hidden';
  }

  div.textContent = element.value.substring(0, cursorOffset);

  if (isInput) {
    div.textContent = (div.textContent || '').replace(/\s/g, '\u00a0');
  }

  const span = document.createElement('span');
  span.textContent = element.value.substring(cursorOffset) || '.';
  div.appendChild(span);

  const position = {
    x: span.offsetLeft + parseInt(computed.borderLeftWidth, 0),
    y: span.offsetTop + parseInt(computed.borderTopWidth, 0),
  };

  document.body.removeChild(div);

  return position;
}
