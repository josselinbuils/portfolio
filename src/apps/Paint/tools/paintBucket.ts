import { faFillDrip } from '@fortawesome/free-solid-svg-icons/faFillDrip';

import { MAIN_BUTTON, SECONDARY_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { colorAt, colorDist, hexToRgba } from '../utils/color';
import { getCanvasContext } from '../utils/getCanvasContext';
import { getPositionInCanvas } from '../utils/getPositionInCanvas';

export const paintBucketDescriptor = {
  description: 'Paint bucket',
  icon: faFillDrip,
  initialState: undefined,
  name: 'paintBucket' as const,
  onMouseDown: handlePaintBucket,
} satisfies DrawToolDescriptor;

function handlePaintBucket(
  event: MouseEvent,
  { getSharedState, mainCanvas, snapshot }: DrawToolListenerData,
) {
  if (![MAIN_BUTTON, SECONDARY_BUTTON].includes(event.button)) {
    return;
  }

  snapshot();

  const context = getCanvasContext(mainCanvas);
  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const { fillColor, strokeColor, tolerance } = getSharedState();
  const [red, green, blue, alpha] = hexToRgba(
    event.button === MAIN_BUTTON ? strokeColor : fillColor,
  );
  const { height, width } = mainCanvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }

  const targetColor = colorAt(data, x, y, width);
  const visited = new Uint8Array(width * height);
  const stack: [number, number][] = [[x, y]];

  visited[y * width + x] = 1;

  while (stack.length) {
    const [x, y] = stack.pop()!;

    if (
      colorDist([...colorAt(data, x, y, width)], [...targetColor]) >
      tolerance * 4
    ) {
      continue;
    }

    const pixelIndex = (y * width + x) * 4;

    data[pixelIndex] = red;
    data[pixelIndex + 1] = green;
    data[pixelIndex + 2] = blue;
    data[pixelIndex + 3] = alpha;

    for (const [neighborX, neighborY] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as [number, number][]) {
      if (
        neighborX < 0 ||
        neighborY < 0 ||
        neighborX >= width ||
        neighborY >= height
      ) {
        continue;
      }
      const visitedIndex = neighborY * width + neighborX;

      if (visited[visitedIndex]) {
        continue;
      }
      visited[visitedIndex] = 1;

      if (
        colorDist(
          [...colorAt(data, neighborX, neighborY, width)],
          [...targetColor],
        ) <=
        tolerance * 4
      ) {
        stack.push([neighborX, neighborY]);
      }
    }
  }
  context.putImageData(imageData, 0, 0);
}
