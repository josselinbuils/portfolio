import { faEraser } from '@fortawesome/free-solid-svg-icons/faEraser';
import { faPencil } from '@fortawesome/free-solid-svg-icons/faPencil';

import { MAIN_BUTTON } from '../../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../../types/DrawToolDescriptor';
import { getCanvasContext } from '../../utils/getCanvasContext';
import { getPositionInCanvas } from '../../utils/getPositionInCanvas';
import { usePaletteStore } from '../palette/usePaletteStore';
import { useDrawStore } from './useDrawStore';

export const eraserDescriptor = {
  description: 'Eraser',
  icon: faEraser,
  name: 'eraser' as const,
  onMouseDown: handleEraser,
} satisfies DrawToolDescriptor;

export const pencilDescriptor = {
  description: 'Pencil',
  icon: faPencil,
  name: 'pencil' as const,
  onMouseDown: handlePencil,
} satisfies DrawToolDescriptor;

function endPath(canvas: HTMLCanvasElement): void {
  getCanvasContext(canvas).globalCompositeOperation = 'source-over';
}

function extendPath(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function handleEraser(
  event: MouseEvent,
  { mainCanvas, snapshot }: DrawToolListenerData,
) {
  if (event.button !== MAIN_BUTTON) {
    return;
  }

  const context = getCanvasContext(mainCanvas);
  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { lineWidth } = useDrawStore.getState();

  snapshot();

  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.globalCompositeOperation = 'destination-out';
  context.beginPath();
  context.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
  context.fillStyle = 'rgba(0,0,0,1)';
  context.fill();
  context.beginPath();
  context.moveTo(x, y);

  function onMouseMove(event: MouseEvent) {
    const { x, y } = getPositionInCanvas(event, mainCanvas);
    extendPath(context, x, y);
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    endPath(mainCanvas);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function handlePencil(
  event: MouseEvent,
  { mainCanvas, snapshot }: DrawToolListenerData,
) {
  if (event.button !== MAIN_BUTTON) {
    return;
  }
  snapshot();

  const context = getCanvasContext(mainCanvas);
  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { lineWidth } = useDrawStore.getState();
  const { strokeColor } = usePaletteStore.getState();

  context.lineWidth = lineWidth;
  context.strokeStyle = strokeColor;
  context.fillStyle = strokeColor;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.globalCompositeOperation = 'source-over';
  context.beginPath();
  context.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(x, y);

  function onMouseMove(event: MouseEvent) {
    const { x, y } = getPositionInCanvas(event, mainCanvas);
    extendPath(context, x, y);
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    endPath(mainCanvas);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
