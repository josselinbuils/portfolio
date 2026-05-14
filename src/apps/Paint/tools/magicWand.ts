import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons/faWandMagicSparkles';

import { MAIN_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { type Selection } from '../types/SharedState';
import { getCanvasContext } from '../utils/getCanvasContext';
import { getPositionInCanvas } from '../utils/getPositionInCanvas';
import { drawAnts } from './selection';

type MagicWandState = {
  antsRaf: number;
  generation: number;
};

export const magicWandDescriptor = {
  description: 'Magic wand',
  icon: faWandMagicSparkles,
  initialState: { antsRaf: 0, generation: 0 },
  name: 'magicWand' as const,
  onMouseDown: handleMagicWand,
  shortcuts: [
    {
      description: 'Delete selection',
      handler: (_event, data) => deleteMagicSelection(data),
      keyStr: 'Backspace,Delete',
    },
  ],
} satisfies DrawToolDescriptor<MagicWandState>;

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

function cancelAnts(data: DrawToolListenerData<MagicWandState>): void {
  const { antsRaf } = data.getToolState();
  if (antsRaf) cancelAnimationFrame(antsRaf);
  getCanvasContext(data.overlayCanvas).clearRect(
    0,
    0,
    data.overlayCanvas.width,
    data.overlayCanvas.height,
  );
  data.setToolState((state) => ({ ...state, antsRaf: 0 }));
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

function deleteMagicSelection(
  data: DrawToolListenerData<MagicWandState>,
): void {
  const { getSharedState, mainCanvas, setSharedState, snapshot } = data;
  const { selection } = getSharedState();

  if (!selection) return;

  snapshot();
  const context = getCanvasContext(mainCanvas);

  if (selection.mask) {
    const imageData = context.getImageData(
      0,
      0,
      mainCanvas.width,
      mainCanvas.height,
    );
    for (let pixelIndex = 0; pixelIndex < selection.mask.length; pixelIndex++) {
      if (selection.mask[pixelIndex]) {
        imageData.data[pixelIndex * 4 + 3] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
  } else {
    context.clearRect(
      selection.x,
      selection.y,
      selection.width,
      selection.height,
    );
  }

  setSharedState((state) => ({ ...state, selection: null }));
  cancelAnts(data);
}

async function handleMagicWand(
  event: MouseEvent,
  data: DrawToolListenerData<MagicWandState>,
): Promise<void> {
  if (event.button !== MAIN_BUTTON) {
    return;
  }

  const {
    getSharedState,
    getToolState,
    mainCanvas,
    overlayCanvas,
    setSharedState,
    setToolState,
  } = data;

  cancelAnts(data);

  const generation = getToolState().generation + 1;
  setToolState((state) => ({ ...state, generation }));

  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { tolerance } = getSharedState();
  const { height, width } = mainCanvas;

  const context = getCanvasContext(mainCanvas);
  const imageData = context.getImageData(0, 0, width, height);
  const startIndex = y * width + x;
  const targetR = imageData.data[startIndex * 4];
  const targetG = imageData.data[startIndex * 4 + 1];
  const targetB = imageData.data[startIndex * 4 + 2];
  const targetA = imageData.data[startIndex * 4 + 3];

  const colorMatch = await computeColorMatch(
    imageData,
    targetR,
    targetG,
    targetB,
    targetA,
    tolerance,
  );

  if (getToolState().generation !== generation) {
    return;
  }

  const mask = bfsConnectedComponent(colorMatch, x, y, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      if (!mask[py * width + px]) continue;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }

  if (maxX < 0) return;

  const boundary = traceBoundary(mask, width, height);

  const selection: Selection = {
    boundary,
    height: maxY - minY + 1,
    imageData: null,
    mask,
    width: maxX - minX + 1,
    x: minX,
    y: minY,
  };

  setSharedState((state) => ({ ...state, selection }));

  let offset = 0;
  const tick = () => {
    offset = (offset + 0.5) % 8;
    drawAnts(overlayCanvas, selection, offset);
    setToolState((state) => ({
      ...state,
      antsRaf: requestAnimationFrame(tick),
    }));
  };
  tick();
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
      if (!mask[py * width + px]) continue;

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
    if (visited[startKey]) continue;

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
