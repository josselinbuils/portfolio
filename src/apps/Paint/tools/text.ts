import { faFont } from '@fortawesome/free-solid-svg-icons/faFont';

import { CANVAS_H, CANVAS_W, FONT_OPTIONS, MAIN_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
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
  setInput: (inp: HTMLTextAreaElement | null) => void,
  mainCanvas: HTMLCanvasElement,
  snapshot: () => void,
): void {
  if (!input) return;
  const txt = input.value;
  const x = +input.dataset.x!;
  const y = +input.dataset.y!;
  const size = +input.dataset.size!;
  const fam = input.dataset.family!;
  const color = input.dataset.color!;
  input.remove();
  setInput(null);
  if (!txt) return;
  snapshot();
  const context = mainCanvas.getContext('2d')!;
  context.fillStyle = color;
  context.font = `${size}px ${fam}`;
  context.textBaseline = 'top';
  txt
    .split('\n')
    .forEach((ln, i) => context.fillText(ln, x, y + i * size * 1.2));
}

function openText(
  event: MouseEvent,
  {
    getSharedState,
    getToolState,
    mainCanvas,
    setToolState,
    snapshot,
    stageInner,
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
  const inp = document.createElement('textarea');

  inp.setAttribute(
    'aria-label',
    'Text input — Enter to commit, Escape to cancel',
  );
  inp.className = state.className;
  inp.style.left = `${position.x * (rect.width / CANVAS_W)}px`;
  inp.style.top = `${position.y * (rect.height / CANVAS_H)}px`;
  inp.style.font = `${state.fontSize}px ${state.fontFamily}`;
  inp.style.color = getSharedState().strokeColor;
  inp.style.lineHeight = '1.2';
  inp.dataset.x = String(position.x);
  inp.dataset.y = String(position.y);
  inp.dataset.size = String(state.fontSize);
  inp.dataset.family = state.fontFamily;
  inp.dataset.color = strokeColor;

  stageInner.appendChild(inp);
  setInput(inp);
  requestAnimationFrame(() => inp.focus());

  inp.addEventListener('input', () => {
    inp.style.width = Math.max(60, inp.scrollWidth + 8) + 'px';
    inp.style.height = Math.max(20, inp.scrollHeight + 4) + 'px';
  });

  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      inp.value = '';
      commitText({ ...state, input: inp }, setInput, mainCanvas, snapshot);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitText({ ...state, input: inp }, setInput, mainCanvas, snapshot);
    }
  });

  inp.addEventListener('blur', () =>
    commitText({ ...state, input: inp }, setInput, mainCanvas, snapshot),
  );
}
