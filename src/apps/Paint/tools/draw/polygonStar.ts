import { faStar } from '@fortawesome/free-regular-svg-icons/faStar';
import { faPentagon } from '@fortawesome/free-solid-svg-icons/faPentagon';
import { create } from 'zustand/react';

import { MAIN_BUTTON, SECONDARY_BUTTON } from '../../constants';
import {
  type ToolDescriptor,
  type ToolListenerData,
} from '../../types/ToolDescriptor';
import { getCanvasContext } from '../../utils/getCanvasContext';
import { getPositionInCanvas } from '../../utils/getPositionInCanvas';
import { usePaletteStore } from '../palette/usePaletteStore';
import { useDrawStore } from './useDrawStore';

type PolygonStarState = {
  sides: number;
};

export const usePolygonStarStore = create<PolygonStarState>(() => ({
  sides: 5,
}));

export const polygonDescriptor = {
  description: 'Polygon',
  icon: faPentagon,
  name: 'polygon' as const,
  onMouseDown: (event, data) => handleMouseDown(event, data, false),
} satisfies ToolDescriptor;

export const starDescriptor = {
  description: 'Star',
  icon: faStar,
  name: 'star' as const,
  onMouseDown: (event, data) => handleMouseDown(event, data, true),
} satisfies ToolDescriptor;

function drawPolygonStar(
  context: CanvasRenderingContext2D,
  center: { x: number; y: number },
  radius: number,
  sides: number,
  starMode: boolean,
  angle: number,
  style: {
    fillColor: string;
    fillOn: boolean;
    lineWidth: number;
    strokeColor: string;
  },
): void {
  const { fillColor, fillOn, lineWidth, strokeColor } = style;

  context.lineWidth = lineWidth;
  context.strokeStyle = strokeColor;
  context.fillStyle = fillColor;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.setLineDash([]);
  context.beginPath();

  if (starMode) {
    const innerRadius = radius * 0.4;
    const totalPoints = sides * 2;

    for (let i = 0; i < totalPoints; i++) {
      const a = angle + (Math.PI * i) / sides;
      const r = i % 2 === 0 ? radius : innerRadius;
      const x = center.x + r * Math.cos(a);
      const y = center.y + r * Math.sin(a);

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
  } else {
    for (let i = 0; i < sides; i++) {
      const a = angle + ((Math.PI * 2) / sides) * i;
      const x = center.x + radius * Math.cos(a);
      const y = center.y + radius * Math.sin(a);

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
  }

  context.closePath();

  if (fillOn) {
    context.fill();
  }
  context.stroke();
}

function handleMouseDown(
  event: MouseEvent,
  data: ToolListenerData,
  starMode: boolean,
): void {
  if (![MAIN_BUTTON, SECONDARY_BUTTON].includes(event.button)) {
    return;
  }

  const { mainCanvas, overlayCanvas, snapshot } = data;
  const startPosition = getPositionInCanvas(event, mainCanvas);

  getCanvasContext(overlayCanvas).clearRect(
    0,
    0,
    overlayCanvas.width,
    overlayCanvas.height,
  );

  const { lineWidth } = useDrawStore.getState();
  const { fillColor, strokeColor } = usePaletteStore.getState();
  const { sides } = usePolygonStarStore.getState();
  const fillOn = event.button === SECONDARY_BUTTON;

  function onMouseMove(moveEvent: MouseEvent): void {
    const { x, y } = getPositionInCanvas(moveEvent, mainCanvas);
    const dx = x - startPosition.x;
    const dy = y - startPosition.y;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const context = getCanvasContext(overlayCanvas);

    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    drawPolygonStar(context, startPosition, radius, sides, starMode, angle, {
      fillColor,
      fillOn,
      lineWidth,
      strokeColor,
    });
  }

  function onMouseUp(upEvent: MouseEvent): void {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    const { x: mx, y: my } = getPositionInCanvas(upEvent, mainCanvas);
    const dx = mx - startPosition.x;
    const dy = my - startPosition.y;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const overlayContext = getCanvasContext(overlayCanvas);

    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (radius > 2) {
      const angle = Math.atan2(dy, dx);
      const mainContext = getCanvasContext(mainCanvas);

      snapshot();

      drawPolygonStar(
        mainContext,
        startPosition,
        radius,
        sides,
        starMode,
        angle,
        { fillColor, fillOn, lineWidth, strokeColor },
      );
    }
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
