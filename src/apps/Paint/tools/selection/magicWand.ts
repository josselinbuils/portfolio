import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons/faWandMagicSparkles';

import { throttle } from '@/platform/utils/throttle';

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

export const magicWandDescriptor = {
  description: 'Magic wand',
  icon: faWandMagicSparkles,
  name: 'magicWand' as const,
  onMouseDown: handleMagicWand,
} satisfies ToolDescriptor;

function applyMagicWand(
  imageData: ImageData,
  clickX: number,
  clickY: number,
  tolerance: number,
): void {
  const { height, width } = imageData;
  const colorMatch = computeColorMatch(
    imageData,
    imageData.data[(clickY * width + clickX) * 4],
    imageData.data[(clickY * width + clickX) * 4 + 1],
    imageData.data[(clickY * width + clickX) * 4 + 2],
    imageData.data[(clickY * width + clickX) * 4 + 3],
    tolerance,
  );
  const mask = bfsConnectedComponent(colorMatch, clickX, clickY, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      if (!mask[py * width + px]) {
        continue;
      }
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
    useSelectionStore.setState({ selection: null });
    return;
  }

  useSelectionStore.setState({
    selection: {
      boundary: traceBoundary(mask, width, height),
      height: maxY - minY + 1,
      imageData: null,
      mask,
      width: maxX - minX + 1,
      x: minX,
      y: minY,
    },
  });
}

function bfsConnectedComponent(
  colorMatch: Uint8Array,
  startX: number,
  startY: number,
  width: number,
  height: number,
): Uint8Array {
  const mask = new Uint8Array(width * height);

  if (
    startX < 0 ||
    startY < 0 ||
    startX >= width ||
    startY >= height ||
    !colorMatch[startY * width + startX]
  ) {
    return mask;
  }

  const visited = new Uint8Array(width * height);
  const pixelCount = width * height;
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const startIndex = startY * width + startX;
  visited[startIndex] = 1;
  queue[tail++] = startIndex;

  while (head < tail) {
    const index = queue[head++];
    mask[index] = 1;

    const x = index % width;
    const y = (index - x) / width;

    if (x > 0) {
      const left = index - 1;
      if (!visited[left] && colorMatch[left]) {
        visited[left] = 1;
        queue[tail++] = left;
      }
    }
    if (x < width - 1) {
      const right = index + 1;
      if (!visited[right] && colorMatch[right]) {
        visited[right] = 1;
        queue[tail++] = right;
      }
    }
    if (y > 0) {
      const up = index - width;
      if (!visited[up] && colorMatch[up]) {
        visited[up] = 1;
        queue[tail++] = up;
      }
    }
    if (y < height - 1) {
      const down = index + width;
      if (!visited[down] && colorMatch[down]) {
        visited[down] = 1;
        queue[tail++] = down;
      }
    }
  }

  return mask;
}

function computeColorMatch(
  imageData: ImageData,
  targetR: number,
  targetG: number,
  targetB: number,
  targetA: number,
  tolerance: number,
): Uint8Array {
  const pixelCount = imageData.width * imageData.height;
  const threshold = tolerance * 4;

  const colorMatch = new Uint8Array(pixelCount);
  for (let index = 0; index < pixelCount; index++) {
    const byteIndex = index * 4;
    const dist =
      Math.abs(imageData.data[byteIndex] - targetR) +
      Math.abs(imageData.data[byteIndex + 1] - targetG) +
      Math.abs(imageData.data[byteIndex + 2] - targetB) +
      Math.abs(imageData.data[byteIndex + 3] - targetA);
    colorMatch[index] = dist <= threshold ? 1 : 0;
  }
  return colorMatch;
}

function handleMagicWand(
  event: MouseEvent,
  { mainCanvas, overlayCanvas }: ToolListenerData,
): void {
  if (event.button !== MAIN_BUTTON) {
    return;
  }
  clearSelection(overlayCanvas);

  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { height, width } = mainCanvas;
  const imageData = getCanvasContext(mainCanvas).getImageData(
    0,
    0,
    width,
    height,
  );

  applyMagicWand(imageData, x, y, 1);

  startAnts(overlayCanvas);

  const onMouseMove = throttle((moveEvent: MouseEvent) => {
    const pos = getPositionInCanvas(moveEvent, mainCanvas);
    const tolerance = Math.min(
      128,
      1 + Math.round(Math.hypot(pos.x - x, pos.y - y) * 0.5),
    );
    applyMagicWand(imageData, x, y, tolerance);
  }, 200);

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove as EventListener);
    window.removeEventListener('mouseup', onMouseUp);
  }

  window.addEventListener('mousemove', onMouseMove as EventListener);
  window.addEventListener('mouseup', onMouseUp);
}

// Traces the boundary of a pixel mask into a Path2D using directed pixel edges.
// Each selected pixel contributes clockwise edges on its unshared sides, producing
// one outer loop per connected region and one inner loop per hole (counter-clockwise).
// Collinear consecutive edges are merged into a single lineTo (O(corners) calls).
function traceBoundary(
  mask: Uint8Array,
  width: number,
  height: number,
): Path2D {
  // Vertex grid is (width+1) × (height+1). Encode vertex (vx,vy) as vy*(width+1)+vx.
  const stride = width + 1;
  const vertexCount = stride * (height + 1);
  // nextVertex[v] = successor vertex index, or -1 if no outgoing edge.
  // Int32Array gives O(1) reads/writes vs Map's hash overhead.
  const nextVertex = new Int32Array(vertexCount).fill(-1);
  // Collect edge-start vertices inline so tracing skips the O(vertexCount) scan.
  const edgeStarts: number[] = [];

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      if (!mask[py * width + px]) {
        continue;
      }

      const topLeft = py * stride + px;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + stride;
      const bottomRight = bottomLeft + 1;

      if (py === 0 || !mask[(py - 1) * width + px]) {
        nextVertex[topLeft] = topRight;
        edgeStarts.push(topLeft);
      }
      if (px === width - 1 || !mask[py * width + px + 1]) {
        nextVertex[topRight] = bottomRight;
        edgeStarts.push(topRight);
      }
      if (py === height - 1 || !mask[(py + 1) * width + px]) {
        nextVertex[bottomRight] = bottomLeft;
        edgeStarts.push(bottomRight);
      }
      if (px === 0 || !mask[py * width + px - 1]) {
        nextVertex[bottomLeft] = topLeft;
        edgeStarts.push(bottomLeft);
      }
    }
  }

  const path = new Path2D();
  const visited = new Uint8Array(vertexCount);

  for (const startKey of edgeStarts) {
    if (visited[startKey]) {
      continue;
    }

    const startX = startKey % stride;
    const startY = Math.floor(startKey / stride);
    path.moveTo(startX, startY);

    // Establish the initial direction from startKey to its successor.
    visited[startKey] = 1;
    let currentKey = nextVertex[startKey];
    let prevX = startX;
    let prevY = startY;
    const currX = currentKey % stride;
    const currY = Math.floor(currentKey / stride);
    let dirX = currX - prevX;
    let dirY = currY - prevY;
    prevX = currX;
    prevY = currY;

    for (;;) {
      visited[currentKey] = 1;
      const nextKey = nextVertex[currentKey];

      // Guard against broken cycles caused by saddle-point overwrites (two
      // selected regions touching at a single corner vertex). In that case the
      // second pixel silently replaces the first pixel's outgoing edge, making
      // the chain never return to startKey.  Close what we have and bail.
      if (nextKey === -1 || (nextKey !== startKey && visited[nextKey])) {
        path.closePath();
        break;
      }

      const nextX = nextKey % stride;
      const nextY = Math.floor(nextKey / stride);
      const newDirX = nextX - prevX;
      const newDirY = nextY - prevY;

      // Only emit a lineTo when the direction changes (i.e. at a corner).
      // Collinear edges are silently skipped, replacing N calls with O(corners).
      if (newDirX !== dirX || newDirY !== dirY) {
        path.lineTo(prevX, prevY);
        dirX = newDirX;
        dirY = newDirY;
      }

      if (nextKey === startKey) {
        path.closePath();
        break;
      }

      prevX = nextX;
      prevY = nextY;
      currentKey = nextKey;
    }
  }

  return path;
}
