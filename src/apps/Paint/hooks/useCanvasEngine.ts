import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import {
  CANVAS_H,
  CANVAS_W,
  FONT_OPTIONS,
  PRESET_PALETTE,
  UNDO_MAX,
} from '../constants';
import { handlePicker } from '../tools/colorPicker';
import { beginPath, endPath, extendPath } from '../tools/eraserAndPencil';
import { paintBucket } from '../tools/paintBucket';
import {
  clearSelection,
  commitSelection,
  drawAnts,
  magicWand,
  pickUpSelection,
  startAnts,
} from '../tools/selection';
import { drawShape } from '../tools/shapes';
import { commitTextIfAny, openTextAt } from '../tools/text';
import { type DrawTool } from '../tools/tools';
import { type DragState } from '../types/DragState';
import { type Selection } from '../types/Selection';

export function useCanvasEngine(textOverlayClassName: string) {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [tool, setToolState] = useState<DrawTool>('pencil');
  const [stroke, setStrokeState] = useState('#111111');
  const [fill, setFillState] = useState('#ffffff');
  const [fillOn, setFillOnState] = useState(false);
  const [width, setWidthState] = useState(3);
  const [tolerance, setToleranceState] = useState(20);
  const [fontSize, setFontSizeState] = useState(24);
  const [fontFamily, setFontFamilyState] = useState(FONT_OPTIONS[0].value);
  const [swatches, setSwatches] = useState<string[]>(PRESET_PALETTE);
  const [status, setStatus] = useState(`${CANVAS_W} × ${CANVAS_H} · 1:1`);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ── Canvas refs ────────────────────────────────────────────────────────────
  const mainRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const selRef = useRef<HTMLCanvasElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);

  // ── Imperative state ───────────────────────────────────────────────────────
  const activeSwatchRef = useRef<'fill' | 'stroke'>('stroke');
  const antsRafRef = useRef<number>(0);
  const dragRef = useRef<DragState | null>(null);
  const fillOnRef = useRef(false);
  const fillRef = useRef('#ffffff');
  const fontFamilyRef = useRef(FONT_OPTIONS[0].value);
  const fontSizeRef = useRef(24);
  const hiddenColorRef = useRef<HTMLInputElement>(null);
  const pathActiveRef = useRef(false);
  const redoStack = useRef<ImageData[]>([]);
  const selectionRef = useRef<null | Selection>(null);
  const strokeRef = useRef('#111111');
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const toleranceRef = useRef(20);
  const toolRef = useRef<DrawTool>('pencil');
  const undoStack = useRef<ImageData[]>([]);
  const widthRef = useRef(3);

  // ── Callback refs (exposed to JSX, set the internal refs above) ───────────
  const setMainRef = useCallback((node: HTMLCanvasElement | null) => {
    mainRef.current = node;
  }, []);
  const setPreviewRef = useCallback((node: HTMLCanvasElement | null) => {
    previewRef.current = node;
  }, []);
  const setSelRef = useCallback((node: HTMLCanvasElement | null) => {
    selRef.current = node;
  }, []);
  const setStageInnerRef = useCallback((node: HTMLDivElement | null) => {
    stageInnerRef.current = node;
  }, []);
  const setHiddenColorRef = useCallback((node: HTMLInputElement | null) => {
    hiddenColorRef.current = node;
  }, []);

  // ── Init canvas ────────────────────────────────────────────────────────────
  useEffect(() => {
    const mctx = mainRef.current!.getContext('2d')!;
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  // ── Undo / redo ────────────────────────────────────────────────────────────
  function snapshot() {
    const mctx = mainRef.current!.getContext('2d')!;
    undoStack.current.push(mctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    if (undoStack.current.length > UNDO_MAX) undoStack.current.shift();
    redoStack.current.splice(0);
    setCanUndo(true);
    setCanRedo(false);
  }

  function undo() {
    if (!undoStack.current.length) return;
    const mctx = mainRef.current!.getContext('2d')!;
    redoStack.current.push(mctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    mctx.putImageData(undoStack.current.pop()!, 0, 0);
    clearSelection({ antsRafRef, mainRef, selectionRef, selRef, toleranceRef });
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }

  function redo() {
    if (!redoStack.current.length) return;
    const mctx = mainRef.current!.getContext('2d')!;
    undoStack.current.push(mctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    mctx.putImageData(redoStack.current.pop()!, 0, 0);
    clearSelection({ antsRafRef, mainRef, selectionRef, selRef, toleranceRef });
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  }

  // ── Setters (keep ref + state in sync) ────────────────────────────────────
  function setTool(name: DrawTool) {
    toolRef.current = name;
    setToolState(name);
    commitTextIfAny(
      {
        fontFamilyRef,
        fontSizeRef,
        mainRef,
        stageInnerRef,
        strokeRef,
        textInputRef,
      },
      snapshot,
    );
  }

  function setStroke(color: string) {
    strokeRef.current = color;
    setStrokeState(color);
  }

  function setFill(color: string) {
    fillRef.current = color;
    setFillState(color);
  }

  function setFillOn(v: boolean) {
    fillOnRef.current = v;
    setFillOnState(v);
  }

  function setWidth(v: number) {
    widthRef.current = v;
    setWidthState(v);
  }

  function setTolerance(v: number) {
    toleranceRef.current = v;
    setToleranceState(v);
  }

  function setFontSize(v: number) {
    fontSizeRef.current = v;
    setFontSizeState(v);
  }

  function setFontFamily(v: string) {
    fontFamilyRef.current = v;
    setFontFamilyState(v);
  }

  function openColorPicker(target: 'fill' | 'stroke') {
    activeSwatchRef.current = target;
    const inp = hiddenColorRef.current!;
    inp.value = target === 'stroke' ? strokeRef.current : fillRef.current;
    inp.oninput = (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (target === 'stroke') setStroke(val);
      else setFill(val);
    };
    inp.click();
  }

  function addSwatch() {
    const inp = hiddenColorRef.current!;
    inp.value = strokeRef.current;
    inp.oninput = (e) =>
      setSwatches((s) => [...s, (e.target as HTMLInputElement).value]);
    inp.click();
  }

  // ── Canvas helpers ─────────────────────────────────────────────────────────
  function clearPreview() {
    previewRef.current!.getContext('2d')!.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }

  function getPos(e: MouseEvent): { x: number; y: number } {
    const r = mainRef.current!.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - r.left) * (CANVAS_W / r.width)),
      y: Math.round((e.clientY - r.top) * (CANVAS_H / r.height)),
    };
  }

  // ── Clear canvas ────────────────────────────────────────────────────────────
  function clearCanvas() {
    if (!confirm('Start a new image? Unsaved work will be lost.')) return;
    snapshot();
    const mctx = mainRef.current!.getContext('2d')!;
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    clearSelection({ antsRafRef, mainRef, selectionRef, selRef, toleranceRef });
  }

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  function onMouseDown(e: MouseEvent) {
    if (e.button === 2) return;
    const p = getPos(e);
    const t = toolRef.current;
    const selRefs = { antsRafRef, mainRef, selectionRef, selRef, toleranceRef };

    if (selectionRef.current && (t === 'select' || t === 'magicWand')) {
      const s = selectionRef.current;
      if (
        p.x >= s.x + s.dx &&
        p.x <= s.x + s.dx + s.w &&
        p.y >= s.y + s.dy &&
        p.y <= s.y + s.dy + s.h
      ) {
        pickUpSelection(selRefs, snapshot);
        dragRef.current = {
          baseDx: s.dx,
          baseDy: s.dy,
          kind: 'selmove',
          startX: p.x,
          startY: p.y,
        };
        return;
      } else {
        commitSelection(selRefs);
      }
    }

    if (t === 'pencil' || t === 'eraser') {
      snapshot();
      beginPath(
        { fillRef, mainRef, pathActiveRef, strokeRef, toolRef, widthRef },
        p,
      );
      dragRef.current = { kind: 'path' };
    } else if (t === 'rect' || t === 'rectRound' || t === 'circle') {
      dragRef.current = { kind: 'shape', tool: t, x0: p.x, y0: p.y };
    } else if (t === 'select') {
      clearSelection(selRefs);
      dragRef.current = { kind: 'marquee', x0: p.x, y0: p.y };
    } else if (t === 'text') {
      openTextAt(
        {
          fontFamilyRef,
          fontSizeRef,
          mainRef,
          stageInnerRef,
          strokeRef,
          textInputRef,
        },
        p,
        textOverlayClassName,
        snapshot,
      );
    } else if (t === 'paintBucket') {
      paintBucket({ fillRef, mainRef, toleranceRef }, p, snapshot);
    } else if (t === 'magicWand') {
      magicWand(selRefs, p, snapshot);
    } else if (t === 'colorPicker') {
      handlePicker({ activeSwatchRef, mainRef }, p, setFill, setStroke);
    }
  }

  function onMouseMove(e: MouseEvent) {
    const p = getPos(e);
    setStatus(
      `${CANVAS_W} × ${CANVAS_H}   ·   ${String(p.x).padStart(4, ' ')}, ${String(p.y).padStart(4, ' ')}`,
    );
    const d = dragRef.current;
    if (!d) return;

    if (d.kind === 'path') {
      extendPath({ mainRef, pathActiveRef }, p);
    } else if (d.kind === 'shape') {
      clearPreview();
      drawShape(
        previewRef.current!.getContext('2d')!,
        { fillOnRef, fillRef, strokeRef, widthRef },
        d.tool!,
        d.x0!,
        d.y0!,
        p.x,
        p.y,
        e.shiftKey,
      );
    } else if (d.kind === 'marquee') {
      const x = Math.min(d.x0!, p.x),
        y = Math.min(d.y0!, p.y);
      const h = Math.abs(p.y - d.y0!),
        w = Math.abs(p.x - d.x0!);
      const sctx = selRef.current!.getContext('2d')!;
      sctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      sctx.lineWidth = 1;
      sctx.setLineDash([4, 4]);
      sctx.strokeStyle = '#fff';
      sctx.strokeRect(x + 0.5, y + 0.5, w, h);
      sctx.lineDashOffset = 4;
      sctx.strokeStyle = '#000';
      sctx.strokeRect(x + 0.5, y + 0.5, w, h);
    } else if (d.kind === 'selmove') {
      const s = selectionRef.current!;
      s.dx = (d.baseDx ?? 0) + (p.x - d.startX!);
      s.dy = (d.baseDy ?? 0) + (p.y - d.startY!);
      drawAnts({ antsRafRef, mainRef, selectionRef, selRef, toleranceRef });
    }
  }

  function onMouseUp(e: MouseEvent) {
    const d = dragRef.current;
    if (!d) return;
    const p = getPos(e);

    if (d.kind === 'path') {
      endPath({ mainRef, pathActiveRef });
    } else if (d.kind === 'shape') {
      clearPreview();
      const ex = e.shiftKey
        ? d.x0! +
          Math.sign(p.x - d.x0! || 1) *
            Math.max(Math.abs(p.x - d.x0!), Math.abs(p.y - d.y0!))
        : p.x;
      const ey = e.shiftKey
        ? d.y0! +
          Math.sign(p.y - d.y0! || 1) *
            Math.max(Math.abs(p.x - d.x0!), Math.abs(p.y - d.y0!))
        : p.y;
      if (d.x0 !== ex || d.y0 !== ey) {
        snapshot();
        drawShape(
          mainRef.current!.getContext('2d')!,
          { fillOnRef, fillRef, strokeRef, widthRef },
          d.tool!,
          d.x0!,
          d.y0!,
          ex,
          ey,
          e.shiftKey,
        );
      }
    } else if (d.kind === 'marquee') {
      const x = Math.min(d.x0!, p.x),
        y = Math.min(d.y0!, p.y);
      const h = Math.abs(p.y - d.y0!),
        w = Math.abs(p.x - d.x0!);
      if (w > 1 && h > 1) {
        selectionRef.current = { dx: 0, dy: 0, h, imageData: null, w, x, y };
        startAnts({ antsRafRef, mainRef, selectionRef, selRef, toleranceRef });
      } else {
        selRef.current!.getContext('2d')!.clearRect(0, 0, CANVAS_W, CANVAS_H);
      }
    }
    dragRef.current = null;
  }

  // ── Window-level mouse listeners ────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  });

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const SHORTCUTS: Record<string, DrawTool> = {
      b: 'pencil',
      c: 'circle',
      e: 'eraser',
      f: 'paintBucket',
      g: 'paintBucket',
      i: 'colorPicker',
      m: 'select',
      p: 'pencil',
      r: 'rect',
      s: 'select',
      t: 'text',
      w: 'magicWand',
    };
    function onKey(ev: KeyboardEvent) {
      if (
        textInputRef.current &&
        document.activeElement === textInputRef.current
      )
        return;
      if (ev.metaKey || ev.ctrlKey) {
        if (ev.key === 'z') {
          ev.preventDefault();
          if (ev.shiftKey) redo();
          else undo();
          return;
        }
        if (ev.key === 'y') {
          ev.preventDefault();
          redo();
          return;
        }
        return;
      }
      const t = SHORTCUTS[ev.key.toLowerCase()];
      if (t) {
        setTool(t);
        return;
      }
      if (
        (ev.key === 'Delete' || ev.key === 'Backspace') &&
        selectionRef.current
      ) {
        snapshot();
        const s = selectionRef.current;
        const mctx = mainRef.current!.getContext('2d')!;
        mctx.fillStyle = '#ffffff';
        mctx.fillRect(s.x + s.dx, s.y + s.dy, s.w, s.h);
        if (s.imageData) selectionRef.current!.imageData = null;
        clearSelection({
          antsRafRef,
          mainRef,
          selectionRef,
          selRef,
          toleranceRef,
        });
      }
      if (ev.key === 'Escape' || ev.key === 'Enter')
        commitSelection({
          antsRafRef,
          mainRef,
          selectionRef,
          selRef,
          toleranceRef,
        });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return {
    // Actions
    addSwatch,
    // State
    canRedo,
    canUndo,
    clearCanvas,
    fill,
    fillOn,
    fontFamily,
    fontSize,
    // Callback refs (functions, not ref objects)
    hiddenColorRef: setHiddenColorRef,
    mainRef: setMainRef,
    onMouseDown,
    openColorPicker,
    previewRef: setPreviewRef,
    redo,
    selRef: setSelRef,
    setFill,
    setFillOn,
    setFontFamily,
    setFontSize,
    setStroke,
    setSwatches,
    setTolerance,
    setTool,
    setWidth,
    stageInnerRef: setStageInnerRef,
    status,
    stroke,
    swatches,
    tolerance,
    tool,
    undo,
    width,
  };
}
