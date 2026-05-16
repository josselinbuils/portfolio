import { faFillDrip } from '@fortawesome/free-solid-svg-icons/faFillDrip';

import { throttle } from '@/platform/utils/throttle';

import { MAIN_BUTTON, SECONDARY_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { hexToRgba } from '../utils/color';
import { getCanvasContext } from '../utils/getCanvasContext';
import { getPositionInCanvas } from '../utils/getPositionInCanvas';
import { usePaletteStore } from './palette/usePaletteStore';
import { useSelectionStore } from './selection/useSelectionStore';

export const paintBucketDescriptor = {
  description: 'Paint bucket',
  icon: faFillDrip,
  name: 'paintBucket' as const,
  onMouseDown: handlePaintBucket,
} satisfies DrawToolDescriptor;

function applyFill(
  context: CanvasRenderingContext2D,
  originalData: Uint8ClampedArray,
  area: { height: number; width: number; x: number; y: number },
  activeColor: string,
  tolerance: number,
): void {
  const { height, width, x, y } = area;
  const threshold = tolerance * 4;
  const pixelCount = width * height;
  const data = originalData.slice();
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const startIndex = y * width + x;
  const targetR = originalData[startIndex * 4];
  const targetG = originalData[startIndex * 4 + 1];
  const targetB = originalData[startIndex * 4 + 2];
  const targetA = originalData[startIndex * 4 + 3];
  const [fillR, fillG, fillB, fillA] = hexToRgba(activeColor);

  let head = 0;
  let tail = 0;

  visited[startIndex] = 1;
  queue[tail++] = startIndex;

  while (head < tail) {
    const index = queue[head++];
    const byteIndex = index * 4;

    data[byteIndex] = fillR;
    data[byteIndex + 1] = fillG;
    data[byteIndex + 2] = fillB;
    data[byteIndex + 3] = fillA;

    const px = index % width;
    const py = (index - px) / width;

    if (px > 0) {
      const left = index - 1;
      if (!visited[left]) {
        visited[left] = 1;
        const bi = left * 4;
        if (
          Math.abs(data[bi] - targetR) +
            Math.abs(data[bi + 1] - targetG) +
            Math.abs(data[bi + 2] - targetB) +
            Math.abs(data[bi + 3] - targetA) <=
          threshold
        ) {
          queue[tail++] = left;
        }
      }
    }
    if (px < width - 1) {
      const right = index + 1;
      if (!visited[right]) {
        visited[right] = 1;
        const bi = right * 4;
        if (
          Math.abs(data[bi] - targetR) +
            Math.abs(data[bi + 1] - targetG) +
            Math.abs(data[bi + 2] - targetB) +
            Math.abs(data[bi + 3] - targetA) <=
          threshold
        ) {
          queue[tail++] = right;
        }
      }
    }
    if (py > 0) {
      const up = index - width;
      if (!visited[up]) {
        visited[up] = 1;
        const bi = up * 4;
        if (
          Math.abs(data[bi] - targetR) +
            Math.abs(data[bi + 1] - targetG) +
            Math.abs(data[bi + 2] - targetB) +
            Math.abs(data[bi + 3] - targetA) <=
          threshold
        ) {
          queue[tail++] = up;
        }
      }
    }
    if (py < height - 1) {
      const down = index + width;
      if (!visited[down]) {
        visited[down] = 1;
        const bi = down * 4;
        if (
          Math.abs(data[bi] - targetR) +
            Math.abs(data[bi + 1] - targetG) +
            Math.abs(data[bi + 2] - targetB) +
            Math.abs(data[bi + 3] - targetA) <=
          threshold
        ) {
          queue[tail++] = down;
        }
      }
    }
  }

  context.putImageData(new ImageData(data, width, height), 0, 0);
}

function handlePaintBucket(
  event: MouseEvent,
  { mainCanvas, snapshot }: DrawToolListenerData,
) {
  if (![MAIN_BUTTON, SECONDARY_BUTTON].includes(event.button)) {
    return;
  }

  const context = getCanvasContext(mainCanvas);
  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { height, width } = mainCanvas;

  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }

  snapshot();

  const { selection } = useSelectionStore.getState();
  const { fillColor, strokeColor } = usePaletteStore.getState();
  const activeColor = event.button === MAIN_BUTTON ? strokeColor : fillColor;

  if (selection) {
    context.save();
    context.fillStyle = activeColor;

    if (selection.boundary) {
      context.fill(selection.boundary, 'nonzero');
    } else {
      context.fillRect(
        selection.x,
        selection.y,
        selection.width,
        selection.height,
      );
    }
    context.restore();
    return;
  }

  const originalData = context.getImageData(0, 0, width, height).data;
  const area = { height, width, x, y };

  applyFill(context, originalData, area, activeColor, 1);

  const onMouseMove = throttle((moveEvent: MouseEvent) => {
    const pos = getPositionInCanvas(moveEvent, mainCanvas);
    const tolerance = Math.min(
      128,
      1 + Math.round(Math.hypot(pos.x - x, pos.y - y) * 0.5),
    );
    applyFill(context, originalData, area, activeColor, tolerance);
  }, 200);

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove as EventListener);
    window.removeEventListener('mouseup', onMouseUp);
  }

  window.addEventListener('mousemove', onMouseMove as EventListener);
  window.addEventListener('mouseup', onMouseUp);
}
