import { faVectorPolygon } from '@fortawesome/free-solid-svg-icons/faVectorPolygon';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons/faWandMagicSparkles';

import type { DrawToolDescriptor } from '../types/DrawToolDescriptor';
import type { Selection } from '../types/Selection';

import { CANVAS_H, CANVAS_W } from '../constants';
import { colorAt, colorDist } from '../utils/color';

export const magicWandDescriptor = {
  description: 'Magic wand',
  icon: faWandMagicSparkles,
  name: 'magicWand' as const,
  shortcut: 'w',
} satisfies DrawToolDescriptor;

export const selectDescriptor = {
  description: 'Marquee select',
  icon: faVectorPolygon,
  name: 'select' as const,
  shortcut: 'm',
} satisfies DrawToolDescriptor;

export type SelectionRefs = {
  antsRafRef: { current: number };
  mainRef: { current: HTMLCanvasElement | null };
  selectionRef: { current: null | Selection };
  selRef: { current: HTMLCanvasElement | null };
  toleranceRef: { current: number };
};

export function clearSelection(refs: SelectionRefs): void {
  refs.selRef.current!.getContext('2d')!.clearRect(0, 0, CANVAS_W, CANVAS_H);
  refs.selectionRef.current = null;
  if (refs.antsRafRef.current) cancelAnimationFrame(refs.antsRafRef.current);
  refs.antsRafRef.current = 0;
}

export function commitSelection(refs: SelectionRefs): void {
  const s = refs.selectionRef.current;
  if (!s) return;
  if (s.imageData) {
    const tmp = document.createElement('canvas');
    tmp.width = s.w;
    tmp.height = s.h;
    tmp.getContext('2d')!.putImageData(s.imageData, 0, 0);
    refs.mainRef
      .current!.getContext('2d')!
      .drawImage(tmp, s.x + s.dx, s.y + s.dy);
  }
  clearSelection(refs);
}

export function drawAnts(refs: SelectionRefs, antOffset = 0): void {
  const sctx = refs.selRef.current!.getContext('2d')!;
  sctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const s = refs.selectionRef.current;
  if (!s) return;
  if (s.imageData && (s.dx !== 0 || s.dy !== 0 || s.freeform)) {
    const tmp = document.createElement('canvas');
    tmp.width = s.w;
    tmp.height = s.h;
    tmp.getContext('2d')!.putImageData(s.imageData, 0, 0);
    sctx.drawImage(tmp, s.x + s.dx, s.y + s.dy);
  }
  sctx.save();
  sctx.lineWidth = 1;
  sctx.setLineDash([4, 4]);
  sctx.lineDashOffset = -antOffset;
  sctx.strokeStyle = '#ffffff';
  sctx.strokeRect(s.x + s.dx + 0.5, s.y + s.dy + 0.5, s.w - 1, s.h - 1);
  sctx.lineDashOffset = -antOffset + 4;
  sctx.strokeStyle = '#000000';
  sctx.strokeRect(s.x + s.dx + 0.5, s.y + s.dy + 0.5, s.w - 1, s.h - 1);
  sctx.restore();
}

export function magicWand(
  refs: SelectionRefs,
  p: { x: number; y: number },
  snapshot: () => void,
): void {
  const mctx = refs.mainRef.current!.getContext('2d')!;
  const H = CANVAS_H,
    W = CANVAS_W;
  const img = mctx.getImageData(0, 0, W, H);
  const d = img.data;
  const target = colorAt(d, p.x, p.y, W);
  const visited = new Uint8Array(W * H);
  const stack: [number, number][] = [[p.x, p.y]];
  visited[p.y * W + p.x] = 1;
  const T = refs.toleranceRef.current * 4;
  let count = 0,
    maxX = 0,
    maxY = 0,
    minX = W,
    minY = H;
  const mask = new Uint8Array(W * H);
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (colorDist([...colorAt(d, x, y, W)], [...target]) > T) continue;
    mask[y * W + x] = 1;
    count++;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
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
  if (!count) return;
  const sh = maxY - minY + 1,
    sw = maxX - minX + 1;
  const tmpCtx = document.createElement('canvas');
  tmpCtx.width = sw;
  tmpCtx.height = sh;
  const selImg = tmpCtx.getContext('2d')!.createImageData(sw, sh);
  for (let yy = 0; yy < sh; yy++) {
    for (let xx = 0; xx < sw; xx++) {
      const gx = xx + minX,
        gy = yy + minY;
      if (!mask[gy * W + gx]) continue;
      const si = (gy * W + gx) * 4,
        ti = (yy * sw + xx) * 4;
      selImg.data[ti] = d[si];
      selImg.data[ti + 1] = d[si + 1];
      selImg.data[ti + 2] = d[si + 2];
      selImg.data[ti + 3] = d[si + 3];
    }
  }
  snapshot();
  for (let yy = 0; yy < sh; yy++) {
    for (let xx = 0; xx < sw; xx++) {
      const gx = xx + minX,
        gy = yy + minY;
      if (!mask[gy * W + gx]) continue;
      const si = (gy * W + gx) * 4;
      d[si] = 255;
      d[si + 1] = 255;
      d[si + 2] = 255;
      d[si + 3] = 255;
    }
  }
  mctx.putImageData(img, 0, 0);
  refs.selectionRef.current = {
    dx: 0,
    dy: 0,
    freeform: true,
    h: sh,
    imageData: selImg,
    w: sw,
    x: minX,
    y: minY,
  };
  startAnts(refs);
}

export function pickUpSelection(
  refs: SelectionRefs,
  snapshot: () => void,
): void {
  const s = refs.selectionRef.current;
  if (!s || s.imageData) return;
  const mctx = refs.mainRef.current!.getContext('2d')!;
  s.imageData = mctx.getImageData(s.x, s.y, s.w, s.h);
  snapshot();
  mctx.fillStyle = '#ffffff';
  mctx.fillRect(s.x, s.y, s.w, s.h);
}

export function startAnts(refs: SelectionRefs): void {
  if (refs.antsRafRef.current) cancelAnimationFrame(refs.antsRafRef.current);
  let off = 0;
  const tick = () => {
    off = (off + 0.5) % 8;
    drawAnts(refs, off);
    refs.antsRafRef.current = requestAnimationFrame(tick);
  };
  tick();
}
