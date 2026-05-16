import { faFont } from '@fortawesome/free-solid-svg-icons/faFont';
import { create } from 'zustand/react';

import { FONT_OPTIONS, MAIN_BUTTON } from '../constants';
import classes from '../Paint.module.css';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { getCanvasContext } from '../utils/getCanvasContext';
import { getPositionInCanvas } from '../utils/getPositionInCanvas';
import { usePaletteStore } from './palette/usePaletteStore';

type TextState = {
  fontFamily: string;
  fontSize: number;
  input: HTMLTextAreaElement | null;
};

export const useTextStore = create<TextState>(() => ({
  fontFamily: FONT_OPTIONS[0].value,
  fontSize: 24,
  input: null,
}));

export const textDescriptor = {
  description: 'Text',
  icon: faFont,
  name: 'text' as const,
  onMouseDown: openText,
} satisfies DrawToolDescriptor;

export function commitText(
  mainCanvas: HTMLCanvasElement,
  snapshot: () => void,
): void {
  const { input } = useTextStore.getState();

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
  useTextStore.setState({ input: null });

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
  { mainCanvas, snapshot, viewportElement }: DrawToolListenerData,
): void {
  if (event.button !== MAIN_BUTTON) {
    return;
  }
  commitText(mainCanvas, snapshot);

  const position = getPositionInCanvas(event, mainCanvas);
  const { strokeColor } = usePaletteStore.getState();
  const { fontFamily, fontSize } = useTextStore.getState();
  const rect = mainCanvas.getBoundingClientRect();
  const textarea = document.createElement('textarea');
  const scale = rect.width / mainCanvas.width;

  textarea.setAttribute(
    'aria-label',
    'Text input — Enter to commit, Escape to cancel',
  );
  textarea.className = classes.textOverlay;
  textarea.dataset.x = String(position.x);
  textarea.dataset.y = String(position.y);
  textarea.dataset.size = String(fontSize);
  textarea.dataset.family = fontFamily;
  textarea.dataset.color = strokeColor;
  textarea.style.left = `${position.x * scale}px`;
  textarea.style.top = `${position.y * scale}px`;
  textarea.style.font = `${fontSize * scale}px ${fontFamily}`;
  textarea.style.color = strokeColor;
  textarea.style.lineHeight = '1.2';

  textarea.addEventListener('blur', () => commitText(mainCanvas, snapshot));

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      textarea.value = '';
      commitText(mainCanvas, snapshot);
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commitText(mainCanvas, snapshot);
    }
  });

  textarea.addEventListener('input', () => {
    textarea.style.width = Math.max(60, textarea.scrollWidth + 8) + 'px';
    textarea.style.height = Math.max(20, textarea.scrollHeight + 4) + 'px';
  });

  viewportElement.appendChild(textarea);
  useTextStore.setState({ input: textarea });
  requestAnimationFrame(() => textarea.focus());
}
