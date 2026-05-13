import { CANVAS_H, CANVAS_W } from '../../../constants';

export interface TextRefs {
  fontFamilyRef: { current: string };
  fontSizeRef: { current: number };
  mainRef: { current: HTMLCanvasElement | null };
  stageInnerRef: { current: HTMLDivElement | null };
  strokeRef: { current: string };
  textInputRef: { current: HTMLTextAreaElement | null };
}

export function commitTextIfAny(refs: TextRefs, snapshot: () => void): void {
  const inp = refs.textInputRef.current;
  if (!inp) return;
  const txt = inp.value;
  const x = +inp.dataset.x!;
  const y = +inp.dataset.y!;
  const size = +inp.dataset.size!;
  const fam = inp.dataset.family!;
  const color = inp.dataset.color!;
  inp.remove();
  refs.textInputRef.current = null;
  if (!txt) return;
  snapshot();
  const mctx = refs.mainRef.current!.getContext('2d')!;
  mctx.fillStyle = color;
  mctx.font = `${size}px ${fam}`;
  mctx.textBaseline = 'top';
  txt.split('\n').forEach((ln, i) => mctx.fillText(ln, x, y + i * size * 1.2));
}

export function openTextAt(
  refs: TextRefs,
  p: { x: number; y: number },
  textOverlayClassName: string,
  snapshot: () => void,
): void {
  commitTextIfAny(refs, snapshot);
  const r = refs.mainRef.current!.getBoundingClientRect();
  const inp = document.createElement('textarea');
  inp.className = textOverlayClassName;
  inp.style.left = `${p.x * (r.width / CANVAS_W)}px`;
  inp.style.top = `${p.y * (r.height / CANVAS_H)}px`;
  inp.style.font = `${refs.fontSizeRef.current}px ${refs.fontFamilyRef.current}`;
  inp.style.color = refs.strokeRef.current;
  inp.style.lineHeight = '1.2';
  inp.dataset.x = String(p.x);
  inp.dataset.y = String(p.y);
  inp.dataset.size = String(refs.fontSizeRef.current);
  inp.dataset.family = refs.fontFamilyRef.current;
  inp.dataset.color = refs.strokeRef.current;
  refs.stageInnerRef.current!.appendChild(inp);
  refs.textInputRef.current = inp;
  requestAnimationFrame(() => inp.focus());
  inp.addEventListener('input', () => {
    inp.style.width = Math.max(60, inp.scrollWidth + 8) + 'px';
    inp.style.height = Math.max(20, inp.scrollHeight + 4) + 'px';
  });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      inp.value = '';
      commitTextIfAny(refs, snapshot);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitTextIfAny(refs, snapshot);
    }
  });
  inp.addEventListener('blur', () => commitTextIfAny(refs, snapshot));
}
