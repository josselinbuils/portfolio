import { faCircle } from '@fortawesome/free-regular-svg-icons/faCircle';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';

import { CANVAS_H, CANVAS_W, MAIN_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { type SharedState } from '../types/SharedState';
import { getCanvasContext } from '../utils/getCanvasContext';
import { getPositionInCanvas } from '../utils/getPositionInCanvas';
import { type DrawTool } from './tools';

type ShapeState = { x0: number; y0: number } | null;

export const circleDescriptor = {
  description: 'Circle',
  icon: faCircle,
  initialState: null,
  name: 'circle' as const,
  onMouseDown: (event, data) => handleShapeMouseDown(event, data, 'circle'),
} satisfies DrawToolDescriptor<ShapeState>;

export const rectDescriptor = {
  description: 'Rectangle',
  icon: faSquare,
  initialState: null,
  name: 'rect' as const,
  onMouseDown: (event, data) => handleShapeMouseDown(event, data, 'rect'),
} satisfies DrawToolDescriptor<ShapeState>;

export const rectRoundDescriptor = {
  description: 'Rounded rectangle',
  icon: faSquare,
  initialState: null,
  name: 'rectRound' as const,
  onMouseDown: (event, data) => handleShapeMouseDown(event, data, 'rectRound'),
} satisfies DrawToolDescriptor<ShapeState>;

export function drawShape(
  context: CanvasRenderingContext2D,
  state: Pick<SharedState, 'fillColor' | 'fillOn' | 'strokeColor' | 'width'>,
  shapeTool: DrawTool,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  shiftKey = false,
): void {
  let ex = x1;
  let ey = y1;

  if (shiftKey) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const m = Math.max(Math.abs(dx), Math.abs(dy));

    ex = x0 + Math.sign(dx || 1) * m;
    ey = y0 + Math.sign(dy || 1) * m;
  }

  const x = Math.min(x0, ex);
  const y = Math.min(y0, ey);
  const h = Math.abs(ey - y0);
  const w = Math.abs(ex - x0);

  applyStrokeFill(context, state);
  context.beginPath();

  if (shapeTool === 'rect') {
    context.rect(x, y, w, h);
  } else if (shapeTool === 'rectRound') {
    const r = Math.min(20, w / 2, h / 2, 4 + state.width * 2);

    if ((context as any).roundRect) {
      (context as any).roundRect(x, y, w, h, r);
    } else {
      context.moveTo(x + r, y);
      context.arcTo(x + w, y, x + w, y + h, r);
      context.arcTo(x + w, y + h, x, y + h, r);
      context.arcTo(x, y + h, x, y, r);
      context.arcTo(x, y, x + w, y, r);
      context.closePath();
    }
  } else if (shapeTool === 'circle') {
    context.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  }

  if (state.fillOn) {
    context.fill();
  }
  context.stroke();
}

function applyStrokeFill(
  context: CanvasRenderingContext2D,
  state: Pick<SharedState, 'fillColor' | 'strokeColor' | 'width'>,
): void {
  context.lineWidth = state.width;
  context.strokeStyle = state.strokeColor;
  context.fillStyle = state.fillColor;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.setLineDash([]);
}

function handleShapeMouseDown(
  event: MouseEvent,
  data: DrawToolListenerData<ShapeState>,
  shapeTool: DrawTool,
): void {
  const { mainCanvas, overlayCanvas, setToolState } = data;

  if (event.button !== MAIN_BUTTON) {
    return;
  }
  const { x, y } = getPositionInCanvas(event, mainCanvas);

  getCanvasContext(overlayCanvas).clearRect(0, 0, CANVAS_W, CANVAS_H);
  setToolState(() => ({ x0: x, y0: y }));

  function onMouseMove(event: MouseEvent) {
    handleShapeMouseMove(event, data, shapeTool);
  }

  function onMouseUp(event: MouseEvent) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    handleShapeMouseUp(event, data, shapeTool);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function handleShapeMouseMove(
  event: MouseEvent,
  {
    getSharedState,
    getToolState,
    mainCanvas,
    overlayCanvas,
  }: DrawToolListenerData<ShapeState>,
  shapeTool: DrawTool,
): void {
  const toolState = getToolState();

  if (!toolState) {
    return;
  }

  const context = getCanvasContext(overlayCanvas);
  const { x, y } = getPositionInCanvas(event, mainCanvas);

  context.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawShape(
    context,
    getSharedState(),
    shapeTool,
    toolState.x0,
    toolState.y0,
    x,
    y,
    event.shiftKey,
  );
}

function handleShapeMouseUp(
  event: MouseEvent,
  {
    getSharedState,
    getToolState,
    mainCanvas,
    overlayCanvas,
    setToolState,
    snapshot,
  }: DrawToolListenerData<ShapeState>,
  shapeTool: DrawTool,
): void {
  const toolState = getToolState();

  if (!toolState) {
    return;
  }
  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { x0, y0 } = toolState;

  setToolState(() => null);
  getCanvasContext(overlayCanvas).clearRect(0, 0, CANVAS_W, CANVAS_H);

  const ex = event.shiftKey
    ? x0 + Math.sign(x - x0 || 1) * Math.max(Math.abs(x - x0), Math.abs(y - y0))
    : x;

  const ey = event.shiftKey
    ? y0 + Math.sign(y - y0 || 1) * Math.max(Math.abs(x - x0), Math.abs(y - y0))
    : y;

  if (x0 !== ex || y0 !== ey) {
    snapshot();
    drawShape(
      mainCanvas.getContext('2d')!,
      getSharedState(),
      shapeTool,
      x0,
      y0,
      ex,
      ey,
      event.shiftKey,
    );
  }
}
