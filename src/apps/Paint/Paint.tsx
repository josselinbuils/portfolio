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
  const [canvasSize, setCanvasSize] = useState({ h: CANVAS_H, w: CANVAS_W });

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageRef = useRef<HTMLImageElement | null>(null);
  const redoStack = useRef<ImageData[]>([]);
  const undoStack = useRef<ImageData[]>([]);

  useEffect(() => {
    toolsStateRef.current['text'] = {
      ...getTextState(),
      className: styles.textOverlay,
    };
  }, []);

  useEffect(() => {
    const context = mainRef.current!.getContext('2d')!;
    if (pendingImageRef.current) {
      context.drawImage(pendingImageRef.current, 0, 0);
      pendingImageRef.current = null;
    } else {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvasSize.w, canvasSize.h);
    }
    setStatus(`${canvasSize.w} × ${canvasSize.h} · 1:1`);
  }, [canvasSize]);

  function snapshot() {
    const canvas = mainRef.current!;
    const context = canvas.getContext('2d')!;
    undoStack.current.push(
      context.getImageData(0, 0, canvas.width, canvas.height),
    );
    if (undoStack.current.length > UNDO_MAX) undoStack.current.shift();
    redoStack.current.splice(0);
    setCanUndo(true);
    setCanRedo(false);
  }

  function undo() {
    if (!undoStack.current.length) return;
    const canvas = mainRef.current!;
    const context = canvas.getContext('2d')!;
    redoStack.current.push(
      context.getImageData(0, 0, canvas.width, canvas.height),
    );
    context.putImageData(undoStack.current.pop()!, 0, 0);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }

  function redo() {
    if (!redoStack.current.length) return;
    const canvas = mainRef.current!;
    const context = canvas.getContext('2d')!;
    undoStack.current.push(
      context.getImageData(0, 0, canvas.width, canvas.height),
    );
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

  function setFillOn(enabled: boolean) {
    setSharedState((state) => ({ ...state, fillOn: enabled }));
  }

  function setWidth(width: number) {
    setSharedState((state) => ({ ...state, width }));
  }

  function setTolerance(tolerance: number) {
    setSharedState((state) => ({ ...state, tolerance }));
  }

  function setFontSize(size: number) {
    toolsStateRef.current['text'] = { ...getTextState(), fontSize: size };
    setFontSizeState(size);
  }

  function setFontFamily(family: string) {
    toolsStateRef.current['text'] = { ...getTextState(), fontFamily: family };
    setFontFamilyState(family);
  }

  function openColorPicker(target: 'fill' | 'stroke') {
    const inp = hiddenColorRef.current!;
    inp.value =
      target === 'stroke' ? sharedState.strokeColor : sharedState.fillColor;
    inp.oninput = (event) => {
      const color = (event.target as HTMLInputElement).value;
      if (target === 'stroke') setStroke(color);
      else setFill(color);
    };
    inp.click();
  }

  function addSwatch() {
    const inp = hiddenColorRef.current!;
    inp.value = sharedState.strokeColor;
    inp.oninput = (event) =>
      setSwatches((swatches) => [
        ...swatches,
        (event.target as HTMLInputElement).value,
      ]);
    inp.click();
  }

  function openImage() {
    fileInputRef.current!.click();
  }

  function handleImageFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      undoStack.current.splice(0);
      redoStack.current.splice(0);
      setCanUndo(false);
      setCanRedo(false);
      pendingImageRef.current = img;
      setCanvasSize({ h: img.naturalHeight, w: img.naturalWidth });
      URL.revokeObjectURL(url);
      fileInputRef.current!.value = '';
    };

    img.src = url;
  }

  function clearCanvas() {
    if (!confirm('Start a new image? Unsaved work will be lost.')) return;
    snapshot();
    const canvas = mainRef.current!;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
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
      const { height, width } = mainRef.current;
      setStatus(
        `${width} × ${height}   ·   ${String(x).padStart(4, ' ')}, ${String(y).padStart(4, ' ')}`,
      );
    }, 33);

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useKeyMap(
    {
      'CtrlCmd+Y,CtrlCmd+Shift+Z': redo,
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
          onOpenImage={openImage}
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
            style={{ height: canvasSize.h, width: canvasSize.w }}
          >
            <canvas
              className={cn(styles.canvasLayer, styles.mainCanvas)}
              height={canvasSize.h}
              onContextMenu={(e) => e.preventDefault()}
              onMouseDown={onMouseDown}
              ref={mainRef}
              width={canvasSize.w}
            />
            <canvas
              className={cn(styles.canvasLayer, styles.overlayCanvas)}
              height={canvasSize.h}
              ref={overlayRef}
              width={canvasSize.w}
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
        <input
          accept="image/*"
          onChange={handleImageFile}
          ref={fileInputRef}
          style="position:absolute;width:0;height:0;opacity:0;pointer-events:none"
          type="file"
        />
      </div>
    </Window>
  );
};

export default Paint;
