import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons/faDrawPolygon';

import { MAIN_BUTTON } from '../../constants';
import {
  type ToolDescriptor,
  type ToolListenerData,
} from '../../types/ToolDescriptor';
import { getCanvasContext } from '../../utils/getCanvasContext';
import { getPositionInCanvas } from '../../utils/getPositionInCanvas';
import { useSelectionStore } from './useSelectionStore';
import { clearSelection } from './utils/clearSelection';
import { startAnts } from './utils/startAnts';

export const lassoDescriptor = {
  description: 'Lasso select',
  icon: faDrawPolygon,
  name: 'lasso' as const,
  onDeactivate: ({ overlayCanvas }) => deactivateLasso(overlayCanvas),
  onMouseDown: handleLasso,
} satisfies ToolDescriptor;

type LassoSession = {
  points: { x: number; y: number }[];
  removeRubberBand: () => void;
};

const CLOSE_THRESHOLD_PX = 10;
const DRAG_THRESHOLD_PX = 5;

let session: LassoSession | null = null;

export function deactivateLasso(overlayCanvas: HTMLCanvasElement): void {
  if (!session) {
    return;
  }
  session.removeRubberBand();
  session = null;
  getCanvasContext(overlayCanvas).clearRect(
    0,
    0,
    overlayCanvas.width,
    overlayCanvas.height,
  );
}

function drawPreview(
  overlayCanvas: HTMLCanvasElement,
  points: { x: number; y: number }[],
  cursor?: { x: number; y: number },
): void {
  const context = getCanvasContext(overlayCanvas);
  context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (points.length === 0) {
    return;
  }

  const path = new Path2D();
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }
  if (cursor) {
    path.lineTo(cursor.x, cursor.y);
  }

  context.save();
  context.lineWidth = 1;
  context.setLineDash([4, 4]);
  context.lineDashOffset = 0;
  context.strokeStyle = '#ffffff';
  context.stroke(path);
  context.lineDashOffset = 4;
  context.strokeStyle = '#000000';
  context.stroke(path);
  context.restore();
}

function finalize(
  points: { x: number; y: number }[],
  mainCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
): void {
  if (points.length < 3) {
    clearSelection(overlayCanvas);
    return;
  }

  const boundary = new Path2D();
  boundary.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    boundary.lineTo(points[i].x, points[i].y);
  }
  boundary.closePath();

  const { height, width } = mainCanvas;
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d')!;
  offCtx.fillStyle = '#000';
  offCtx.fill(boundary);

  const imgData = offCtx.getImageData(0, 0, width, height);
  const mask = new Uint8Array(width * height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < width * height; i++) {
    if (imgData.data[i * 4 + 3] > 0) {
      mask[i] = 1;
      const px = i % width;
      const py = Math.floor(i / width);
      if (px < minX) {
        minX = px;
      }
      if (px > maxX) {
        maxX = px;
      }
      if (py < minY) {
        minY = py;
      }
      if (py > maxY) {
        maxY = py;
      }
    }
  }

  if (maxX < 0) {
    clearSelection(overlayCanvas);
    return;
  }

  useSelectionStore.setState({
    selection: {
      boundary,
      height: maxY - minY + 1,
      imageData: null,
      mask,
      width: maxX - minX + 1,
      x: minX,
      y: minY,
    },
  });
  startAnts(overlayCanvas);
}

function handleLasso(
  event: MouseEvent,
  { mainCanvas, overlayCanvas }: ToolListenerData,
): void {
  if (event.button !== MAIN_BUTTON) {
    return;
  }

  const pos = getPositionInCanvas(event, mainCanvas);

  // Ongoing polygonal session: close, add freehand segment, or add vertex
  if (session) {
    const { points } = session;
    const start = points[0];
    const distFromStart = Math.hypot(pos.x - start.x, pos.y - start.y);

    if (distFromStart <= CLOSE_THRESHOLD_PX && points.length > 2) {
      session.removeRubberBand();
      const pts = session.points;
      session = null;
      finalize(pts, mainCanvas, overlayCanvas);
      return;
    }

    // Pause rubber band while determining click vs. freehand drag
    session.removeRubberBand();
    let dragging = false;

    function onSegMove(moveEvent: MouseEvent) {
      const movePos = getPositionInCanvas(moveEvent, mainCanvas);
      if (
        !dragging &&
        Math.hypot(movePos.x - pos.x, movePos.y - pos.y) >= DRAG_THRESHOLD_PX
      ) {
        dragging = true;
        points.push(pos);
      }
      if (dragging) {
        points.push(movePos);
        drawPreview(overlayCanvas, points);
      }
    }

    function onSegUp(upEvent: MouseEvent) {
      window.removeEventListener('mousemove', onSegMove);
      window.removeEventListener('mouseup', onSegUp);

      if (dragging) {
        points.push(getPositionInCanvas(upEvent, mainCanvas));
      } else {
        points.push(pos);
      }

      drawPreview(overlayCanvas, points);

      function onRubberBand(moveEvent: MouseEvent) {
        if (!session) {
          window.removeEventListener('mousemove', onRubberBand);
          return;
        }
        drawPreview(
          overlayCanvas,
          session.points,
          getPositionInCanvas(moveEvent, mainCanvas),
        );
      }

      window.addEventListener('mousemove', onRubberBand);
      session!.removeRubberBand = () =>
        window.removeEventListener('mousemove', onRubberBand);
    }

    window.addEventListener('mousemove', onSegMove);
    window.addEventListener('mouseup', onSegUp);
    return;
  }

  // Start new lasso
  clearSelection(overlayCanvas);

  const points: { x: number; y: number }[] = [pos];
  let freehandMode = false;

  function onMouseMove(moveEvent: MouseEvent) {
    const movePos = getPositionInCanvas(moveEvent, mainCanvas);

    if (!freehandMode) {
      if (
        Math.hypot(movePos.x - pos.x, movePos.y - pos.y) >= DRAG_THRESHOLD_PX
      ) {
        freehandMode = true;
      }
    }

    if (freehandMode) {
      points.push(movePos);
      drawPreview(overlayCanvas, points);
    }
  }

  function onMouseUp(upEvent: MouseEvent) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    if (freehandMode) {
      points.push(getPositionInCanvas(upEvent, mainCanvas));
      finalize(points, mainCanvas, overlayCanvas);
    } else {
      // Enter polygonal mode with rubber-band preview
      function onRubberBand(moveEvent: MouseEvent) {
        if (!session) {
          window.removeEventListener('mousemove', onRubberBand);
          return;
        }
        const cursor = getPositionInCanvas(moveEvent, mainCanvas);
        drawPreview(overlayCanvas, session.points, cursor);
      }

      window.addEventListener('mousemove', onRubberBand);

      session = {
        points,
        removeRubberBand: () =>
          window.removeEventListener('mousemove', onRubberBand),
      };
    }
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
