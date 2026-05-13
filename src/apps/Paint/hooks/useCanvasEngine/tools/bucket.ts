import { CANVAS_H, CANVAS_W } from '../../../constants';
import { colorAt, colorDist, hexToRgba } from '../../../utils/color';

export interface BucketRefs {
  fillRef: { current: string };
  mainRef: { current: HTMLCanvasElement | null };
  toleranceRef: { current: number };
}

export function paintBucket(
  refs: BucketRefs,
  p: { x: number; y: number },
  snapshot: () => void,
): void {
  snapshot();
  const mctx = refs.mainRef.current!.getContext('2d')!;
  const [r, g, b, a] = hexToRgba(refs.fillRef.current);
  const H = CANVAS_H,
    W = CANVAS_W;
  const img = mctx.getImageData(0, 0, W, H);
  const d = img.data;
  if (p.x < 0 || p.y < 0 || p.x >= W || p.y >= H) return;
  const target = colorAt(d, p.x, p.y, W);
  const visited = new Uint8Array(W * H);
  const stack: [number, number][] = [[p.x, p.y]];
  visited[p.y * W + p.x] = 1;
  const T = refs.toleranceRef.current * 4;
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (colorDist([...colorAt(d, x, y, W)], [...target]) > T) continue;
    const i = (y * W + x) * 4;
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = a;
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as [number, number][]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const idx = ny * W + nx;
      if (visited[idx]) continue;
      visited[idx] = 1;
      if (colorDist([...colorAt(d, nx, ny, W)], [...target]) <= T)
        stack.push([nx, ny]);
    }
  }
  mctx.putImageData(img, 0, 0);
}
