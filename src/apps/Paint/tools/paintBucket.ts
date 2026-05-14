import { faFillDrip } from '@fortawesome/free-solid-svg-icons/faFillDrip';

import {
  CANVAS_H,
  CANVAS_W,
  MAIN_BUTTON,
  SECONDARY_BUTTON,
} from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { colorAt, colorDist, hexToRgba } from '../utils/color';
import { getCanvasContext } from '../utils/getCanvasContext';

export const paintBucketDescriptor = {
  description: 'Paint bucket',
  icon: faFillDrip,
  initialState: undefined,
  name: 'paintBucket' as const,
  onMouseDown: handlePaintBucket,
  shortcut: 'g',
} satisfies DrawToolDescriptor;

function handlePaintBucket({
  event,
  getSharedState,
  mainCanvas,
  position: { x, y },
  snapshot,
}: DrawToolListenerData) {
  if (![MAIN_BUTTON, SECONDARY_BUTTON].includes(event.button)) {
    return;
  }

  snapshot();
  const context = getCanvasContext(mainCanvas);
  const { fillColor, strokeColor, tolerance } = getSharedState();
  const [r, g, b, a] = hexToRgba(
    event.button === MAIN_BUTTON ? strokeColor : fillColor,
  );
  const imageData = context.getImageData(0, 0, CANVAS_W, CANVAS_H);
  const { data } = imageData;

  if (x < 0 || y < 0 || x >= CANVAS_W || y >= CANVAS_H) {
    return;
  }

  const targetColor = colorAt(data, x, y, CANVAS_W);
  const visited = new Uint8Array(CANVAS_W * CANVAS_H);
  const stack: [number, number][] = [[x, y]];

  visited[y * CANVAS_W + x] = 1;

  while (stack.length) {
    const [x, y] = stack.pop()!;

    if (
      colorDist([...colorAt(data, x, y, CANVAS_W)], [...targetColor]) >
      tolerance * 4
    ) {
      continue;
    }

    const i = (y * CANVAS_W + x) * 4;

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;

    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as [number, number][]) {
      if (nx < 0 || ny < 0 || nx >= CANVAS_W || ny >= CANVAS_H) {
        continue;
      }
      const idx = ny * CANVAS_W + nx;

      if (visited[idx]) {
        continue;
      }
      visited[idx] = 1;

      if (
        colorDist([...colorAt(data, nx, ny, CANVAS_W)], [...targetColor]) <=
        tolerance * 4
      ) {
        stack.push([nx, ny]);
      }
    }
  }
  context.putImageData(imageData, 0, 0);
}
