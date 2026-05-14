import cn from 'classnames';
import { useEffect, useRef, useState } from 'preact/hooks';

import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { throttle } from '@/platform/utils/throttle';

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
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  const [currentTool, setCurrentTool] = useState<DrawTool>('pencil');
  const [fontSize, setFontSizeState] = useState(INITIAL_TEXT_STATE.fontSize);
  const [fontFamily, setFontFamilyState] = useState(
    INITIAL_TEXT_STATE.fontFamily,
  );
  const [swatches, setSwatches] = useState<string[]>(PRESET_PALETTE);
  const [status, setStatus] = useState(`${CANVAS_W} × ${CANVAS_H} · 1:1`);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [sharedState, setSharedState] = useState<SharedState>({
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

  const hiddenColorRef = useRef<HTMLInputElement>(null);
  const redoStack = useRef<ImageData[]>([]);
  const undoStack = useRef<ImageData[]>([]);

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
    setCurrentTool(name);
    commitText(getTextState(), setTextInput, mainRef.current!, snapshot);
  }

  function setStroke(color: string) {
    setSharedState((state) => ({ ...state, strokeColor: color }));
  }

  function setFill(color: string) {
    setSharedState((state) => ({ ...state, fillColor: color }));
  }

  function setFillOn(v: boolean) {
    setSharedState((state) => ({ ...state, fillOn: v }));
  }

  function setWidth(v: number) {
    setSharedState((state) => ({ ...state, width: v }));
  }

  function setTolerance(v: number) {
    setSharedState((state) => ({ ...state, tolerance: v }));
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
    const inp = hiddenColorRef.current!;
    inp.value =
      target === 'stroke' ? sharedState.strokeColor : sharedState.fillColor;
    inp.oninput = (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (target === 'stroke') setStroke(val);
      else setFill(val);
    };
    inp.click();
  }

  function addSwatch() {
    const inp = hiddenColorRef.current!;
    inp.value = sharedState.strokeColor;
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

  function createListenerData(): DrawToolListenerData {
    if (!mainRef.current || !overlayRef.current) {
      throw new Error('Main or overlay canvas ref null');
    }
    return {
      getSharedState: () => sharedState,
      getToolState: () => toolsStateRef.current[currentTool],
      mainCanvas: mainRef.current,
      overlayCanvas: overlayRef.current,
      setSharedState,
      setToolState: setToolState(currentTool),
      snapshot,
      stageInner: stageInnerRef.current!,
    };
  }

  function onMouseDown(event: MouseEvent) {
    if (!mainRef.current || !overlayRef.current) {
      return;
    }

    const toolDescriptor = tools.find(({ name }) => name === currentTool) as
      | DrawToolDescriptor
      | undefined;

    if (!toolDescriptor) {
      throw new Error('Descriptor not found');
    }

    toolDescriptor.onMouseDown(event, createListenerData());
  }

  useEffect(() => {
    const onMouseMove = throttle((event: MouseEvent) => {
      if (!mainRef.current) {
        return;
      }
      const { x, y } = getPositionInCanvas(event, mainRef.current);
      setStatus(
        `${CANVAS_W} × ${CANVAS_H}   ·   ${String(x).padStart(4, ' ')}, ${String(y).padStart(4, ' ')}`,
      );
    }, 33);

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useKeyMap(
    {
      'CtrlCmd+Shift+Z': redo,
      'CtrlCmd+Y': redo,
      'CtrlCmd+Z': undo,
    },
    active,
  );

  useKeyMap(
    Object.fromEntries(
      tools.flatMap(({ name, shortcuts }: DrawToolDescriptor) =>
        (shortcuts ?? []).map(({ handler, keyStr }) => [
          keyStr,
          (event: KeyboardEvent) => {
            if (currentTool !== name) {
              return false;
            }
            return handler(event, createListenerData());
          },
        ]),
      ),
    ),
    active,
  );

  const stageCursor =
    currentTool === 'text'
      ? styles.cursorText
      : currentTool === 'paintBucket'
        ? styles.cursorBucket
        : styles.cursorCrosshair;

  return (
    <Window
      active={active}
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
          fill={sharedState.fillColor}
          fillOn={sharedState.fillOn}
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
          stroke={sharedState.strokeColor}
          tolerance={sharedState.tolerance}
          tool={currentTool}
          width={sharedState.width}
        />

        <div className={cn(styles.stage, stageCursor)}>
          <div
            className={styles.stageInner}
            ref={stageInnerRef}
            style={{ height: CANVAS_H, width: CANVAS_W }}
          >
            <canvas
              className={cn(styles.canvasLayer, styles.mainCanvas)}
              height={CANVAS_H}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={onMouseDown}
              ref={mainRef}
              width={CANVAS_W}
            />
            <canvas
              className={cn(styles.canvasLayer, styles.overlayCanvas)}
              height={CANVAS_H}
              ref={overlayRef}
              width={CANVAS_W}
            />
          </div>
        </div>

        <Palette
          fill={sharedState.fillColor}
          onAddSwatch={addSwatch}
          onOpenColorPicker={openColorPicker}
          onSetFill={setFill}
          onSetStroke={setStroke}
          status={status}
          stroke={sharedState.strokeColor}
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
