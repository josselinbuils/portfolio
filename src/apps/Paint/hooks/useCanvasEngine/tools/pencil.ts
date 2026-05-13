import type { DrawTool } from '../../../interfaces/DrawTool';

export interface PencilRefs {
  fillRef: { current: string };
  mainRef: { current: HTMLCanvasElement | null };
  pathActiveRef: { current: boolean };
  strokeRef: { current: string };
  toolRef: { current: DrawTool };
  widthRef: { current: number };
}

export function beginPath(refs: PencilRefs, p: { x: number; y: number }): void {
  const mctx = refs.mainRef.current!.getContext('2d')!;
  refs.pathActiveRef.current = true;
  mctx.lineWidth = refs.widthRef.current;
  mctx.strokeStyle = refs.strokeRef.current;
  mctx.fillStyle = refs.fillRef.current;
  mctx.lineCap = 'round';
  mctx.lineJoin = 'round';
  mctx.globalCompositeOperation =
    refs.toolRef.current === 'eraser' ? 'destination-out' : 'source-over';
  mctx.beginPath();
  mctx.arc(p.x, p.y, refs.widthRef.current / 2, 0, Math.PI * 2);
  mctx.fillStyle =
    refs.toolRef.current === 'eraser'
      ? 'rgba(0,0,0,1)'
      : refs.strokeRef.current;
  mctx.fill();
  mctx.beginPath();
  mctx.moveTo(p.x, p.y);
}

export function endPath(
  refs: Pick<PencilRefs, 'mainRef' | 'pathActiveRef'>,
): void {
  refs.pathActiveRef.current = false;
  refs.mainRef.current!.getContext('2d')!.globalCompositeOperation =
    'source-over';
}

export function extendPath(
  refs: Pick<PencilRefs, 'mainRef' | 'pathActiveRef'>,
  p: { x: number; y: number },
): void {
  if (!refs.pathActiveRef.current) return;
  const mctx = refs.mainRef.current!.getContext('2d')!;
  mctx.lineTo(p.x, p.y);
  mctx.stroke();
  mctx.beginPath();
  mctx.moveTo(p.x, p.y);
}
