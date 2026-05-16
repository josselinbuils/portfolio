import { faCircle } from '@fortawesome/free-regular-svg-icons/faCircle';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';
import { create } from 'zustand/react';

import { MAIN_BUTTON } from '../../constants';
import {
  type ToolDescriptor,
  type ToolListenerData,
} from '../../types/ToolDescriptor';
import { getCanvasContext } from '../../utils/getCanvasContext';
import { getPositionInCanvas } from '../../utils/getPositionInCanvas';
import { usePaletteStore } from '../palette/usePaletteStore';
import { type Tool } from '../tools';
import { useDrawStore } from './useDrawStore';

type ShapeState = {
  fillOn: boolean;
  startPosition: { x0: number; y0: number } | null;
};

export const useShapeStore = create<ShapeState>(() => ({
  fillOn: false,
  startPosition: null,
}));

export const circleDescriptor = {
  description: 'Circle',
  icon: faCircle,
  name: 'circle' as const,
  onMouseDown: (event, data) => handleShapeMouseDown(event, data, 'circle'),
} satisfies ToolDescriptor;

export const rectDescriptor = {
  description: 'Rectangle',
  icon: faSquare,
  name: 'rect' as const,
  onMouseDown: (event, data) => handleShapeMouseDown(event, data, 'rect'),
} satisfies ToolDescriptor;

export const rectRoundDescriptor = {
  description: 'Rounded rectangle',
  icon: faSquare,
  name: 'rectRound' as const,
  onMouseDown: (event, data) => handleShapeMouseDown(event, data, 'rectRound'),
} satisfies ToolDescriptor;

function drawShape(
  context: CanvasRenderingContext2D,
  shapeTool: Tool,
  rect: { x0: number; x1: number; y0: number; y1: number },
  style: {
    fillColor: string;
    fillOn: boolean;
    lineWidth: number;
    strokeColor: string;
  },
  keepRatio: boolean,
): void {
  const { x0, x1, y0, y1 } = rect;
  let endX = x1;
  let endY = y1;

  if (keepRatio) {
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
  const { fillColor, fillOn, lineWidth, strokeColor } = style;

  context.lineWidth = lineWidth;
  context.strokeStyle = strokeColor;
  context.fillStyle = fillColor;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.setLineDash([]);
  context.beginPath();

  if (shapeTool === 'rect') {
    context.rect(x, y, width, height);
  } else if (shapeTool === 'rectRound') {
    const cornerRadius = Math.min(20, width / 2, height / 2, 4 + lineWidth * 2);

    if (context.roundRect) {
      context.roundRect(x, y, width, height, cornerRadius);
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

  if (fillOn) {
    context.fill();
  }
  context.stroke();
}

function handleShapeMouseDown(
  event: MouseEvent,
  data: ToolListenerData,
  shapeTool: Tool,
): void {
  const { mainCanvas, overlayCanvas } = data;

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

  useShapeStore.setState({
    startPosition: { x0: x, y0: y },
  });

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
  { mainCanvas, overlayCanvas }: ToolListenerData,
  shapeTool: Tool,
): void {
  const { fillOn, startPosition } = useShapeStore.getState();

  if (!startPosition) {
    return;
  }

  const context = getCanvasContext(overlayCanvas);
  const { x0, y0 } = startPosition;
  const { x: x1, y: y1 } = getPositionInCanvas(event, mainCanvas);
  const { lineWidth } = useDrawStore.getState();
  const { fillColor, strokeColor } = usePaletteStore.getState();

  context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  drawShape(
    context,
    shapeTool,
    { x0, x1, y0, y1 },
    { fillColor, fillOn, lineWidth, strokeColor },
    event.shiftKey,
  );
}

function handleShapeMouseUp(
  event: MouseEvent,
  { mainCanvas, overlayCanvas, snapshot }: ToolListenerData,
  shapeTool: Tool,
): void {
  const { fillOn, startPosition } = useShapeStore.getState();

  if (!startPosition) {
    return;
  }
  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { x0, y0 } = startPosition;

  useShapeStore.setState({ startPosition: null });

  getCanvasContext(overlayCanvas).clearRect(
    0,
    0,
    overlayCanvas.width,
    overlayCanvas.height,
  );

  const x1 = event.shiftKey
    ? x0 + Math.sign(x - x0 || 1) * Math.max(Math.abs(x - x0), Math.abs(y - y0))
    : x;

  const y1 = event.shiftKey
    ? y0 + Math.sign(y - y0 || 1) * Math.max(Math.abs(x - x0), Math.abs(y - y0))
    : y;

  if (x0 !== x1 || y0 !== y1) {
    const { lineWidth } = useDrawStore.getState();
    const { fillColor, strokeColor } = usePaletteStore.getState();

    snapshot();
    drawShape(
      getCanvasContext(mainCanvas),
      shapeTool,
      { x0, x1, y0, y1 },
      { fillColor, fillOn, lineWidth, strokeColor },
      event.shiftKey,
    );
  }
}
