import cn from 'classnames';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';

import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { download } from '@/platform/utils/download';
import { throttle } from '@/platform/utils/throttle';

import { Toolbar } from './components/Toolbar/Toolbar';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MIDDLE_BUTTON,
  UNDO_MAX,
  ZOOM_LEVELS,
} from './constants';
import classes from './Paint.module.css';
import { Palette } from './tools/palette/components/Palette/Palette';
import { clearSelection } from './tools/selection/utils/clearSelection';
import { deleteSelection } from './tools/selection/utils/deleteSelection';
import { selectAll } from './tools/selection/utils/selectAll';
import { type Tool, tools } from './tools/tools';
import {
  type ToolDescriptor,
  type ToolListenerData,
} from './types/ToolDescriptor';
import { computeFitCanvasSize } from './utils/computeFitCanvasSize';
import { computeFitZoom } from './utils/computeFitZoom';
import { getCanvasContext } from './utils/getCanvasContext';
import { getPositionInCanvas } from './utils/getPositionInCanvas';

export const Paint: WindowComponent = ({
  active,
  windowRef,
  ...injectedWindowProps
}) => {
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [status, setStatus] = useState('');
  const [undoRedoState, setUndoRedoState] = useState<{
    redoStack: ImageData[];
    undoStack: ImageData[];
  }>({
    redoStack: [],
    undoStack: [],
  });
  const [canvasSize, setCanvasSize] = useState({
    height: CANVAS_HEIGHT,
    width: CANVAS_WIDTH,
  });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const pendingPanOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const [panOffsetStyle, setPanOffsetStyle] = useState('translate(0px, 0px)');
  const mainRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportInnerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageRef = useRef<HTMLImageElement | null>(null);

  function resetPanOffset() {
    panOffsetRef.current = { x: 0, y: 0 };
    pendingPanOffsetRef.current = null;
    setPanOffsetStyle('translate(0px, 0px)');
  }

  useEffect(() => {
    if (!mainRef.current) {
      return;
    }
    const context = getCanvasContext(mainRef.current);

    if (pendingImageRef.current) {
      context.drawImage(pendingImageRef.current, 0, 0);
      pendingImageRef.current = null;
    } else {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }
  }, [canvasSize]);

  useLayoutEffect(() => {
    if (!viewportRef.current) {
      return;
    }
    const newCanvasSize = computeFitCanvasSize(viewportRef.current);

    setCanvasSize(newCanvasSize);
    setStatus(`${newCanvasSize.width} × ${newCanvasSize.height}`);
  }, []);

  useLayoutEffect(() => {
    if (pendingPanOffsetRef.current) {
      const { x, y } = pendingPanOffsetRef.current;
      panOffsetRef.current = { x, y };
      if (viewportInnerRef.current) {
        viewportInnerRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      setPanOffsetStyle(`translate(${x}px, ${y}px)`);
      pendingPanOffsetRef.current = null;
    }
  }, [zoom, canvasSize]);

  function snapshot() {
    if (!mainRef.current) {
      return;
    }
    const canvas = mainRef.current;
    const context = getCanvasContext(canvas);
    const { undoStack } = undoRedoState;

    setUndoRedoState({
      redoStack: [],
      undoStack: [
        ...undoStack.slice(0, UNDO_MAX - 1),
        context.getImageData(0, 0, canvas.width, canvas.height),
      ],
    });
  }

  function undo() {
    const { redoStack, undoStack } = undoRedoState;

    if (!undoStack.length || !mainRef.current) {
      return;
    }
    const canvas = mainRef.current;
    const context = getCanvasContext(canvas);

    setUndoRedoState({
      redoStack: [
        ...redoStack,
        context.getImageData(0, 0, canvas.width, canvas.height),
      ],
      undoStack: undoStack.slice(0, -1),
    });

    const previousImageData = undoStack.at(-1);

    if (previousImageData) {
      context.putImageData(previousImageData, 0, 0);
    }
  }

  function redo() {
    const { redoStack, undoStack } = undoRedoState;

    if (!redoStack.length || !mainRef.current) {
      return;
    }
    const canvas = mainRef.current;
    const context = getCanvasContext(canvas);

    setUndoRedoState({
      redoStack: redoStack.slice(0, -1),
      undoStack: [
        ...undoStack.slice(0, UNDO_MAX - 1),
        context.getImageData(0, 0, canvas.width, canvas.height),
      ],
    });

    const nextImageData = redoStack.at(-1);

    if (nextImageData) {
      context.putImageData(nextImageData, 0, 0);
    }
  }

  function setTool(name: Tool) {
    const currentDescriptor = tools.find(
      (tool) => tool.name === currentTool,
    ) as ToolDescriptor | undefined;

    currentDescriptor?.onDeactivate?.(createListenerData());
    setCurrentTool(name);
  }

  function openImage() {
    fileInputRef.current?.click();
  }

  function handleImageFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setUndoRedoState({ redoStack: [], undoStack: [] });
      const fitZoom = computeFitZoom(
        viewportRef.current!,
        img.naturalWidth,
        img.naturalHeight,
      );
      setZoom(fitZoom);
      resetPanOffset();
      pendingImageRef.current = img;
      setCanvasSize({ height: img.naturalHeight, width: img.naturalWidth });
      URL.revokeObjectURL(url);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    img.src = url;
  }

  function saveImage() {
    if (!mainRef.current) {
      return;
    }
    mainRef.current.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      download('image.png', url);
      URL.revokeObjectURL(url);
    });
  }

  function clearCanvas() {
    if (!confirm('Start a new image? Unsaved work will be lost.')) {
      return;
    }
    setUndoRedoState({ redoStack: [], undoStack: [] });
    setZoom(1);
    resetPanOffset();
    if (!viewportRef.current) {
      return;
    }
    setCanvasSize(computeFitCanvasSize(viewportRef.current));
  }

  function createListenerData(): ToolListenerData {
    if (!mainRef.current || !overlayRef.current || !viewportInnerRef.current) {
      throw new Error('Canvas or viewport refs null');
    }
    return {
      mainCanvas: mainRef.current,
      overlayCanvas: overlayRef.current,
      snapshot,
      viewportElement: viewportInnerRef.current,
    };
  }

  function onMouseDown(event: MouseEvent) {
    if (event.button === MIDDLE_BUTTON) {
      return;
    }

    if (!mainRef.current || !overlayRef.current) {
      return;
    }

    const toolDescriptor = tools.find(({ name }) => name === currentTool) as
      | ToolDescriptor
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
        `${String(x).padStart(4, ' ')}, ${String(y).padStart(4, ' ')}   ·   ${width} × ${height}`,
      );
    }, 33);

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  function applyZoom(newZoom: number) {
    const zoomRatio = newZoom / zoom;
    pendingPanOffsetRef.current = {
      x: panOffsetRef.current.x * zoomRatio,
      y: panOffsetRef.current.y * zoomRatio,
    };
    setZoom(newZoom);
  }

  function zoomIn() {
    const level = ZOOM_LEVELS.find((l) => l > zoom);

    if (level !== undefined) {
      applyZoom(level);
    }
  }

  function zoomOut() {
    const level = [...ZOOM_LEVELS].reverse().find((l) => l < zoom);

    if (level !== undefined) {
      applyZoom(level);
    }
  }

  function resetZoom() {
    resetPanOffset();
    setZoom(1);
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();

      const currentViewport = viewportRef.current;
      if (!currentViewport) {
        return;
      }

      const newZoom =
        event.deltaY < 0
          ? ZOOM_LEVELS.find((level) => level > zoom)
          : [...ZOOM_LEVELS].reverse().find((level) => level < zoom);

      if (newZoom === undefined) {
        return;
      }

      const viewportRect = currentViewport.getBoundingClientRect();
      const cursorX = event.clientX - viewportRect.left;
      const cursorY = event.clientY - viewportRect.top;
      const viewportStyle = window.getComputedStyle(currentViewport);
      const paddingLeft = parseFloat(viewportStyle.paddingLeft);
      const paddingRight = parseFloat(viewportStyle.paddingRight);
      const paddingTop = parseFloat(viewportStyle.paddingTop);
      const paddingBottom = parseFloat(viewportStyle.paddingBottom);
      const availableWidth =
        currentViewport.clientWidth - paddingLeft - paddingRight;
      const availableHeight =
        currentViewport.clientHeight - paddingTop - paddingBottom;

      const prevCanvasDisplayWidth = canvasSize.width * zoom;
      const prevCanvasDisplayHeight = canvasSize.height * zoom;
      const newCanvasDisplayWidth = canvasSize.width * newZoom;
      const newCanvasDisplayHeight = canvasSize.height * newZoom;

      // Natural margin is the centering offset flex gives when canvas fits the
      // viewport; it clamps to 0 when the canvas is larger (margin: auto → 0).
      const prevNaturalMarginX = Math.max(
        0,
        (availableWidth - prevCanvasDisplayWidth) / 2,
      );
      const prevNaturalMarginY = Math.max(
        0,
        (availableHeight - prevCanvasDisplayHeight) / 2,
      );
      const newNaturalMarginX = Math.max(
        0,
        (availableWidth - newCanvasDisplayWidth) / 2,
      );
      const newNaturalMarginY = Math.max(
        0,
        (availableHeight - newCanvasDisplayHeight) / 2,
      );

      // Canvas pixel under the cursor before zoom — must stay there after zoom.
      const prevCanvasLeft =
        paddingLeft + prevNaturalMarginX + panOffsetRef.current.x;
      const prevCanvasTop =
        paddingTop + prevNaturalMarginY + panOffsetRef.current.y;
      const imageX = (cursorX - prevCanvasLeft) / zoom;
      const imageY = (cursorY - prevCanvasTop) / zoom;

      pendingPanOffsetRef.current = {
        x: cursorX - paddingLeft - newNaturalMarginX - imageX * newZoom,
        y: cursorY - paddingTop - newNaturalMarginY - imageY * newZoom,
      };
      setZoom(newZoom);
    }

    function handleMiddleMouseDown(event: MouseEvent) {
      if (event.button !== MIDDLE_BUTTON) {
        return;
      }
      const currentViewport = viewportRef.current;
      if (!currentViewport) {
        return;
      }
      event.preventDefault();

      const startMouseX = event.clientX;
      const startMouseY = event.clientY;
      const startPanOffsetX = panOffsetRef.current.x;
      const startPanOffsetY = panOffsetRef.current.y;
      const viewportStyle = window.getComputedStyle(currentViewport);
      const paddingLeft = parseFloat(viewportStyle.paddingLeft);
      const paddingRight = parseFloat(viewportStyle.paddingRight);
      const paddingTop = parseFloat(viewportStyle.paddingTop);
      const paddingBottom = parseFloat(viewportStyle.paddingBottom);

      setIsPanning(true);

      function onMouseMove(moveEvent: MouseEvent) {
        if (!currentViewport) {
          return;
        }
        const deltaX = moveEvent.clientX - startMouseX;
        const deltaY = moveEvent.clientY - startMouseY;
        const viewportWidth = currentViewport.clientWidth;
        const viewportHeight = currentViewport.clientHeight;
        const availableWidth = viewportWidth - paddingLeft - paddingRight;
        const availableHeight = viewportHeight - paddingTop - paddingBottom;
        const canvasDisplayWidth = canvasSize.width * zoom;
        const canvasDisplayHeight = canvasSize.height * zoom;

        // Natural canvas origin: centered when canvas fits, at padding edge when large.
        const naturalCanvasLeft =
          paddingLeft + Math.max(0, (availableWidth - canvasDisplayWidth) / 2);
        const naturalCanvasTop =
          paddingTop + Math.max(0, (availableHeight - canvasDisplayHeight) / 2);

        panOffsetRef.current = {
          x: Math.max(
            40 - canvasDisplayWidth - naturalCanvasLeft,
            Math.min(
              viewportWidth - 40 - naturalCanvasLeft,
              startPanOffsetX + deltaX,
            ),
          ),
          y: Math.max(
            40 - canvasDisplayHeight - naturalCanvasTop,
            Math.min(
              viewportHeight - 40 - naturalCanvasTop,
              startPanOffsetY + deltaY,
            ),
          ),
        };

        if (viewportInnerRef.current) {
          viewportInnerRef.current.style.transform = `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px)`;
        }
      }

      function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        setIsPanning(false);
        setPanOffsetStyle(
          `translate(${panOffsetRef.current.x}px, ${panOffsetRef.current.y}px)`,
        );
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('mousedown', handleMiddleMouseDown);

    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('mousedown', handleMiddleMouseDown);
    };
  }, [canvasSize, zoom]);

  useKeyMap(
    {
      'Backspace,Delete': () => deleteSelection(createListenerData()),
      'CtrlCmd+A': () => {
        const { mainCanvas, overlayCanvas } = createListenerData();
        selectAll(mainCanvas, overlayCanvas);
      },
      'CtrlCmd+S': saveImage,
      'CtrlCmd+Y,CtrlCmd+Shift+Z': redo,
      'CtrlCmd+Z': undo,
      Escape: () => {
        const listenerData = createListenerData();
        const descriptor = tools.find(({ name }) => name === currentTool) as
          | ToolDescriptor
          | undefined;

        descriptor?.onDeactivate?.(listenerData);
        clearSelection(listenerData.overlayCanvas);
      },
    },
    active,
  );

  useKeyMap(
    Object.fromEntries(
      (
        tools.find(({ name }) => name === currentTool) as ToolDescriptor
      ).shortcuts?.map(({ handler, keyStr }) => [
        keyStr,
        (event: KeyboardEvent) => handler(event, createListenerData()),
      ]) ?? [],
    ),
    active,
  );

  const viewportCursor = isPanning
    ? classes.cursorGrab
    : currentTool === 'text'
      ? classes.cursorText
      : currentTool === 'paintBucket'
        ? classes.cursorBucket
        : classes.cursorCrosshair;

  return (
    <Window
      active={active}
      minHeight={640}
      minWidth={1024}
      ref={windowRef}
      resizable
      title="Paint"
      {...injectedWindowProps}
    >
      <div className={classes.paint}>
        <Toolbar
          canRedo={undoRedoState.redoStack.length > 0}
          canUndo={undoRedoState.undoStack.length > 0}
          onClear={clearCanvas}
          onOpenImage={openImage}
          onRedo={redo}
          onResetZoom={resetZoom}
          onSaveImage={saveImage}
          onSetTool={setTool}
          onUndo={undo}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          tool={currentTool}
          zoom={zoom}
        />

        <div className={cn(classes.viewport, viewportCursor)} ref={viewportRef}>
          <div
            className={classes.viewportInner}
            ref={viewportInnerRef}
            style={{
              height: canvasSize.height * zoom,
              transform: panOffsetStyle,
              width: canvasSize.width * zoom,
            }}
          >
            <canvas
              className={cn(classes.canvasLayer, classes.mainCanvas)}
              height={canvasSize.height}
              onContextMenu={(event) => event.preventDefault()}
              onMouseDown={onMouseDown}
              ref={mainRef}
              width={canvasSize.width}
            />
            <canvas
              className={cn(classes.canvasLayer, classes.overlayCanvas)}
              height={canvasSize.height}
              ref={overlayRef}
              width={canvasSize.width}
            />
          </div>
        </div>
        <Palette status={status} />
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
