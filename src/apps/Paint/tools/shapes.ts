import { faCircle } from '@fortawesome/free-regular-svg-icons/faCircle';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';

import { MAIN_BUTTON } from '../constants';
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
  let endX = x1;
  let endY = y1;

  if (shiftKey) {
    const deltaX = x1 - x0;
    const deltaY = y1 - y0;
    const squareSize = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    endX = x0 + Math.sign(deltaX || 1) * squareSize;
    endY = y0 + Math.sign(deltaY || 1) * squareSize;
  }

  const x = Math.min(x0, endX);
  const y = Math.min(y0, endY);
  const height = Math.abs(endY - y0);
  const width = Math.abs(endX - x0);

  applyStrokeFill(context, state);
  context.beginPath();

  if (shapeTool === 'rect') {
    context.rect(x, y, width, height);
  } else if (shapeTool === 'rectRound') {
    const cornerRadius = Math.min(
      20,
      width / 2,
      height / 2,
      4 + state.width * 2,
    );

    if ((context as any).roundRect) {
      (context as any).roundRect(x, y, width, height, cornerRadius);
    } else {
      context.moveTo(x + cornerRadius, y);
      context.arcTo(x + width, y, x + width, y + height, cornerRadius);
      context.arcTo(x + width, y + height, x, y + height, cornerRadius);
      context.arcTo(x, y + height, x, y, cornerRadius);
      context.arcTo(x, y, x + width, y, cornerRadius);
      context.closePath();
    }
  } else if (shapeTool === 'circle') {
    context.ellipse(
      x + width / 2,
      y + height / 2,
      width / 2,
      height / 2,
      0,
      0,
      Math.PI * 2,
    );
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

  getCanvasContext(overlayCanvas).clearRect(
    0,
    0,
    overlayCanvas.width,
    overlayCanvas.height,
  );
  setToolState(() => ({ x0: x, y0: y }));

  function onMouseMove(moveEvent: MouseEvent) {
    handleShapeMouseMove(moveEvent, data, shapeTool);
  }

  function onMouseUp(upEvent: MouseEvent) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    handleShapeMouseUp(upEvent, data, shapeTool);
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

  context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
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
  getCanvasContext(overlayCanvas).clearRect(
    0,
    0,
    overlayCanvas.width,
    overlayCanvas.height,
  );

  const endX = event.shiftKey
    ? x0 + Math.sign(x - x0 || 1) * Math.max(Math.abs(x - x0), Math.abs(y - y0))
    : x;

  const endY = event.shiftKey
    ? y0 + Math.sign(y - y0 || 1) * Math.max(Math.abs(x - x0), Math.abs(y - y0))
    : y;

  if (x0 !== endX || y0 !== endY) {
    snapshot();
    drawShape(
      getCanvasContext(mainCanvas),
      getSharedState(),
      shapeTool,
      x0,
      y0,
      endX,
      endY,
      event.shiftKey,
    );
  }
}
