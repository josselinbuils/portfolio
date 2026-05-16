import { faFillDrip } from '@fortawesome/free-solid-svg-icons/faFillDrip';
import { create } from 'zustand/react';

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

type PaintBucketState = {
  tolerance: number;
};

export const usePaintBucketStore = create<PaintBucketState>(() => ({
  tolerance: 20,
}));

export const paintBucketDescriptor = {
  description: 'Paint bucket',
  icon: faFillDrip,
  name: 'paintBucket' as const,
  onMouseDown: handlePaintBucket,
} satisfies DrawToolDescriptor;

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

  const [fillR, fillG, fillB, fillA] = hexToRgba(activeColor);

  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  const startIndex = y * width + x;
  const targetR = data[startIndex * 4];
  const targetG = data[startIndex * 4 + 1];
  const targetB = data[startIndex * 4 + 2];
  const targetA = data[startIndex * 4 + 3];
  const { tolerance } = usePaintBucketStore.getState();
  const threshold = tolerance * 4;

  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
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

  context.putImageData(imageData, 0, 0);
}
