import { faCircle } from '@fortawesome/free-regular-svg-icons/faCircle';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';

import { type DrawToolDescriptor } from '../types/DrawToolDescriptor';
import { type DrawTool } from './tools';

export const circleDescriptor = {
  description: 'Ellipse',
  icon: faCircle,
  name: 'circle' as const,
  shortcut: 'c',
} satisfies DrawToolDescriptor;

export const rectDescriptor = {
  description: 'Rectangle',
  icon: faSquare,
  name: 'rect' as const,
  shortcut: 'r',
} satisfies DrawToolDescriptor;

export const rectRoundDescriptor = {
  description: 'Rounded rectangle',
  icon: faSquare,
  name: 'rectRound' as const,
  shortcut: '',
} satisfies DrawToolDescriptor;

export type ShapeRefs = {
  fillOnRef: { current: boolean };
  fillRef: { current: string };
  strokeRef: { current: string };
  widthRef: { current: number };
};

export function drawShape(
  ctx: CanvasRenderingContext2D,
  refs: ShapeRefs,
  shapeTool: DrawTool,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  shiftKey = false,
): void {
  let ex = x1,
    ey = y1;
  if (shiftKey) {
    const dx = x1 - x0,
      dy = y1 - y0;
    const m = Math.max(Math.abs(dx), Math.abs(dy));
    ex = x0 + Math.sign(dx || 1) * m;
    ey = y0 + Math.sign(dy || 1) * m;
  }
  const x = Math.min(x0, ex),
    y = Math.min(y0, ey);
  const h = Math.abs(ey - y0),
    w = Math.abs(ex - x0);
  applyStrokeFill(ctx, refs);
  ctx.beginPath();
  if (shapeTool === 'rect') {
    ctx.rect(x, y, w, h);
  } else if (shapeTool === 'rectRound') {
    const r = Math.min(20, w / 2, h / 2, 4 + refs.widthRef.current * 2);
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  } else if (shapeTool === 'circle') {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  }
  if (refs.fillOnRef.current) ctx.fill();
  ctx.stroke();
}

function applyStrokeFill(ctx: CanvasRenderingContext2D, refs: ShapeRefs): void {
  ctx.lineWidth = refs.widthRef.current;
  ctx.strokeStyle = refs.strokeRef.current;
  ctx.fillStyle = refs.fillRef.current;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}
