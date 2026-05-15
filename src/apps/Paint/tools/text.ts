import { faFont } from '@fortawesome/free-solid-svg-icons/faFont';

import { FONT_OPTIONS, MAIN_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { getCanvasContext } from '../utils/getCanvasContext';
import { getPositionInCanvas } from '../utils/getPositionInCanvas';

export type TextState = {
  className: string;
  fontFamily: string;
  fontSize: number;
  input: HTMLTextAreaElement | null;
};

export const INITIAL_TEXT_STATE: TextState = {
  className: '',
  fontFamily: FONT_OPTIONS[0].value,
  fontSize: 24,
  input: null,
};

export const textDescriptor = {
  description: 'Text',
  icon: faFont,
  initialState: INITIAL_TEXT_STATE,
  name: 'text' as const,
  onMouseDown: openText,
} satisfies DrawToolDescriptor<TextState>;

export function commitText(
  { input }: TextState,
  setInput: (input: HTMLTextAreaElement | null) => void,
  mainCanvas: HTMLCanvasElement,
  snapshot: () => void,
): void {
  if (!input) {
    return;
  }
  const text = input.value;
  const x = +(input.dataset.x ?? '0');
  const y = +(input.dataset.y ?? '0');
  const size = +(input.dataset.size ?? '0');
  const fontFamily = input.dataset.family ?? '';
  const color = input.dataset.color ?? '';
  input.remove();
  setInput(null);
  if (!text) {
    return;
  }
  snapshot();
  const context = getCanvasContext(mainCanvas);
  context.fillStyle = color;
  context.font = `${size}px ${fontFamily}`;
  context.textBaseline = 'top';
  text
    .split('\n')
    .forEach((line, lineIndex) =>
      context.fillText(line, x, y + lineIndex * size * 1.2),
    );
}

function openText(
  event: MouseEvent,
  {
    getSharedState,
    getToolState,
    mainCanvas,
    setToolState,
    snapshot,
    viewportInner,
  }: DrawToolListenerData<TextState>,
): void {
  if (event.button !== MAIN_BUTTON) {
    return;
  }

  const position = getPositionInCanvas(event, mainCanvas);
  const state = getToolState();
  const { strokeColor } = getSharedState();

  const setInput = (input: HTMLTextAreaElement | null) => {
    setToolState((state) => ({ ...state, input }));
  };

  commitText(state, setInput, mainCanvas, snapshot);

  const rect = mainCanvas.getBoundingClientRect();
  const textarea = document.createElement('textarea');

  textarea.setAttribute(
    'aria-label',
    'Text input — Enter to commit, Escape to cancel',
  );
  textarea.className = state.className;
  const scale = rect.width / mainCanvas.width;
  textarea.style.left = `${position.x * scale}px`;
  textarea.style.top = `${position.y * scale}px`;
  textarea.style.font = `${state.fontSize * scale}px ${state.fontFamily}`;
  textarea.style.color = getSharedState().strokeColor;
  textarea.style.lineHeight = '1.2';
  textarea.dataset.x = String(position.x);
  textarea.dataset.y = String(position.y);
  textarea.dataset.size = String(state.fontSize);
  textarea.dataset.family = state.fontFamily;
  textarea.dataset.color = strokeColor;

  viewportInner.appendChild(textarea);
  setInput(textarea);
  requestAnimationFrame(() => textarea.focus());

  textarea.addEventListener('input', () => {
    textarea.style.width = Math.max(60, textarea.scrollWidth + 8) + 'px';
    textarea.style.height = Math.max(20, textarea.scrollHeight + 4) + 'px';
  });

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      textarea.value = '';
      commitText({ ...state, input: textarea }, setInput, mainCanvas, snapshot);
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commitText({ ...state, input: textarea }, setInput, mainCanvas, snapshot);
    }
  });

  textarea.addEventListener('blur', () =>
    commitText({ ...state, input: textarea }, setInput, mainCanvas, snapshot),
  );
}
