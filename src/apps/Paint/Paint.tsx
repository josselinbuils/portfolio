import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';

import { Palette } from './components/Palette/Palette';
import { Toolbar } from './components/Toolbar/Toolbar';
import { CANVAS_H, CANVAS_W, PRESET_PALETTE, UNDO_MAX } from './constants';
import styles from './Paint.module.scss';
import { commitText, INITIAL_TEXT_STATE, type TextState } from './tools/text';
import { type DrawTool, tools } from './tools/tools';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from './types/DrawToolDescriptor';
import { type SharedState } from './types/SharedState';
import { getPositionInCanvas } from './utils/getPositionInCanvas';

const initialToolsState = Object.fromEntries(
  tools.map(({ initialState, name }) => [name, initialState]),
) as Record<DrawTool, unknown>;

export const Paint: WindowComponent = ({
  windowRef,
  ...injectedWindowProps
}) => {
  const [currentTool, setCurrentTool] = useState<DrawTool>('pencil');
  const [stroke, setStrokeState] = useState('#111111');
  const [fill, setFillState] = useState('#ffffff');
  const [fillOn, setFillOnState] = useState(false);
  const [width, setWidthState] = useState(3);
  const [tolerance, setToleranceState] = useState(20);
  const [fontSize, setFontSizeState] = useState(INITIAL_TEXT_STATE.fontSize);
  const [fontFamily, setFontFamilyState] = useState(
    INITIAL_TEXT_STATE.fontFamily,
  );
  const [swatches, setSwatches] = useState<string[]>(PRESET_PALETTE);
  const [status, setStatus] = useState(`${CANVAS_W} × ${CANVAS_H} · 1:1`);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sharedStateRef = useRef<SharedState>({
    fillColor: '#ffffff',
    fillOn: false,
    selection: null,
    strokeColor: '#111111',
    tolerance: 20,
    width: 3,
  });
  const toolsStateRef = useRef<Record<DrawTool, unknown>>(initialToolsState);

  function setToolState(toolName: DrawTool) {
    return (setter: (state: unknown) => unknown) => {
      toolsStateRef.current[toolName] = setter(toolsStateRef.current[toolName]);
    };
  }

  function getTextState(): TextState {
    return toolsStateRef.current['text'] as TextState;
  }

  function setTextInput(inp: HTMLTextAreaElement | null) {
    toolsStateRef.current['text'] = { ...getTextState(), input: inp };
  }

  const mainRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);

  const activeSwatchRef = useRef<'fill' | 'stroke'>('stroke');
  const fillOnRef = useRef(false);
  const fillRef = useRef('#ffffff');
  const hiddenColorRef = useRef<HTMLInputElement>(null);
  const redoStack = useRef<ImageData[]>([]);
  const strokeRef = useRef('#111111');
  const toleranceRef = useRef(20);
  const toolRef = useRef<DrawTool>('pencil');
  const undoStack = useRef<ImageData[]>([]);
  const widthRef = useRef(3);

  useEffect(() => {
    const context = mainRef.current!.getContext('2d')!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);
    toolsStateRef.current['text'] = {
      ...getTextState(),
      className: styles.textOverlay,
    };
  }, []);

  function snapshot() {
    const context = mainRef.current!.getContext('2d')!;
    undoStack.current.push(context.getImageData(0, 0, CANVAS_W, CANVAS_H));
    if (undoStack.current.length > UNDO_MAX) undoStack.current.shift();
    redoStack.current.splice(0);
    setCanUndo(true);
    setCanRedo(false);
  }

  function undo() {
    if (!undoStack.current.length) return;
    const context = mainRef.current!.getContext('2d')!;
    redoStack.current.push(context.getImageData(0, 0, CANVAS_W, CANVAS_H));
    context.putImageData(undoStack.current.pop()!, 0, 0);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }

  function redo() {
    if (!redoStack.current.length) return;
    const context = mainRef.current!.getContext('2d')!;
    undoStack.current.push(context.getImageData(0, 0, CANVAS_W, CANVAS_H));
    context.putImageData(redoStack.current.pop()!, 0, 0);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  }

  function setTool(name: DrawTool) {
    toolRef.current = name;
    setCurrentTool(name);
    commitText(getTextState(), setTextInput, mainRef.current!, snapshot);
  }

  function setStroke(color: string) {
    strokeRef.current = color;
    sharedStateRef.current = { ...sharedStateRef.current, strokeColor: color };
    setStrokeState(color);
  }

  function setFill(color: string) {
    fillRef.current = color;
    sharedStateRef.current = { ...sharedStateRef.current, fillColor: color };
    setFillState(color);
  }

  function setFillOn(v: boolean) {
    fillOnRef.current = v;
    sharedStateRef.current = { ...sharedStateRef.current, fillOn: v };
    setFillOnState(v);
  }

  function setWidth(v: number) {
    widthRef.current = v;
    sharedStateRef.current = { ...sharedStateRef.current, width: v };
    setWidthState(v);
  }

  function setTolerance(v: number) {
    toleranceRef.current = v;
    sharedStateRef.current = { ...sharedStateRef.current, tolerance: v };
    setToleranceState(v);
  }

  function setFontSize(v: number) {
    toolsStateRef.current['text'] = { ...getTextState(), fontSize: v };
    setFontSizeState(v);
  }

  function setFontFamily(v: string) {
    toolsStateRef.current['text'] = { ...getTextState(), fontFamily: v };
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

  function clearCanvas() {
    if (!confirm('Start a new image? Unsaved work will be lost.')) return;
    snapshot();
    const context = mainRef.current!.getContext('2d')!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  const createListenerData = useCallback(
    (event: MouseEvent, toolName: DrawTool): DrawToolListenerData => {
      function setSharedState(setter: (state: SharedState) => SharedState) {
        const prev = sharedStateRef.current;
        const next = setter(prev);
        sharedStateRef.current = next;
        if (next.strokeColor !== prev.strokeColor) setStroke(next.strokeColor);
        if (next.fillColor !== prev.fillColor) setFill(next.fillColor);
        if (next.fillOn !== prev.fillOn) setFillOn(next.fillOn);
        if (next.width !== prev.width) setWidth(next.width);
        if (next.tolerance !== prev.tolerance) setTolerance(next.tolerance);
      }

      if (!mainRef.current) {
        throw new Error('Main canvas ref is null');
      }
      if (!overlayRef.current) {
        throw new Error('Overlay canvas ref is null');
      }

      return {
        event,
        getSharedState: () => sharedStateRef.current,
        getToolState: () => toolsStateRef.current[toolName],
        mainCanvas: mainRef.current,
        overlayCanvas: overlayRef.current,
        position: getPositionInCanvas(event, mainRef.current),
        setSharedState,
        setToolState: setToolState(toolName),
        snapshot,
        stageInner: stageInnerRef.current!,
      };
    },
    [],
  );

  function onMouseDown(event: MouseEvent) {
    if (!mainRef.current) {
      return;
    }
    const t = toolRef.current;

    const toolDescriptor = tools.find((d) => d.name === t) as
      | DrawToolDescriptor
      | undefined;
    if (!toolDescriptor) throw new Error('Descriptor not found');

    toolDescriptor.onMouseDown(createListenerData(event, t));
  }

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {
      if (!mainRef.current) {
        return;
      }
      const { x, y } = getPositionInCanvas(event, mainRef.current);
      setStatus(
        `${CANVAS_W} × ${CANVAS_H}   ·   ${String(x).padStart(4, ' ')}, ${String(y).padStart(4, ' ')}`,
      );
    }

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    const SHORTCUTS: Record<string, DrawTool> = Object.fromEntries(
      tools.map(({ name, shortcut }) => [shortcut, name]),
    );

    function onKey(ev: KeyboardEvent) {
      const { input } = getTextState();
      if (input && document.activeElement === input) return;
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
      // const { selection } = selectionStateRef.current;
      // if ((ev.key === 'Delete' || ev.key === 'Backspace') && selection) {
      //   snapshot();
      //   const context = mainRef.current!.getContext('2d')!;
      //   context.fillStyle = '#ffffff';
      //   context.fillRect(
      //     selection.x + selection.dx,
      //     selection.y + selection.dy,
      //     selection.w,
      //     selection.h,
      //   );
      //   if (selection.imageData) {
      //     selectionStateRef.current = {
      //       ...selectionStateRef.current,
      //       selection: { ...selection, imageData: null },
      //     };
      //   }
      //   // clearSelection(createSelectionContext());
      // }
    }
    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  });

  const stageCursor =
    currentTool === 'text'
      ? styles.cursorText
      : currentTool === 'paintBucket'
        ? styles.cursorBucket
        : styles.cursorCrosshair;

  return (
    <Window
      minHeight={500}
      minWidth={800}
      ref={windowRef}
      resizable
      title="Paint"
      {...injectedWindowProps}
    >
      <div className={styles.paint}>
        <Toolbar
          canRedo={canRedo}
          canUndo={canUndo}
          fill={fill}
          fillOn={fillOn}
          fontFamily={fontFamily}
          fontSize={fontSize}
          onClear={clearCanvas}
          onFillOnChange={setFillOn}
          onFontFamilyChange={setFontFamily}
          onFontSizeChange={setFontSize}
          onOpenColorPicker={openColorPicker}
          onRedo={redo}
          onSetTool={setTool}
          onSetWidth={setWidth}
          onToleranceChange={setTolerance}
          onUndo={undo}
          stroke={stroke}
          tolerance={tolerance}
          tool={currentTool}
          width={width}
        />

        <div className={`${styles.stage} ${stageCursor}`}>
          <div
            className={styles.stageInner}
            ref={stageInnerRef}
            style={{ height: CANVAS_H, width: CANVAS_W }}
          >
            <canvas
              className={`${styles.canvasLayer} ${styles.mainCanvas}`}
              height={CANVAS_H}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={onMouseDown}
              ref={mainRef}
              width={CANVAS_W}
            />
            <canvas
              className={`${styles.canvasLayer} ${styles.overlayCanvas}`}
              height={CANVAS_H}
              ref={overlayRef}
              width={CANVAS_W}
            />
          </div>
        </div>

        <Palette
          fill={fill}
          onAddSwatch={addSwatch}
          onOpenColorPicker={openColorPicker}
          onSetFill={setFill}
          onSetStroke={setStroke}
          status={status}
          stroke={stroke}
          swatches={swatches}
        />

        <input
          ref={hiddenColorRef}
          style="position:absolute;width:0;height:0;opacity:0;pointer-events:none"
          type="color"
        />
      </div>
    </Window>
  );
};

export default Paint;
