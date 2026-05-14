import { faVectorPolygon } from '@fortawesome/free-solid-svg-icons/faVectorPolygon';

import { MAIN_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { type Selection } from '../types/SharedState';
import { getCanvasContext } from '../utils/getCanvasContext';
import { getPositionInCanvas } from '../utils/getPositionInCanvas';

type SelectionState = {
  antsRaf: number;
};

export const selectDescriptor = {
  description: 'Marquee select',
  icon: faVectorPolygon,
  initialState: { antsRaf: 0 },
  name: 'select' as const,
  onMouseDown: handleSelect,
  shortcuts: [
    {
      description: 'Select all',
      handler: (_event, data) => selectAll(data),
      keyStr: 'CtrlCmd+A',
    },
    {
      description: 'Delete selection',
      handler: (_event, data) => deleteSelection(data),
      keyStr: 'Delete,Backspace',
    },
  ],
} satisfies DrawToolDescriptor<SelectionState>;

export function clearSelection({
  getToolState,
  overlayCanvas,
  setToolState,
}: DrawToolListenerData<SelectionState>): void {
  const { antsRaf } = getToolState();

  if (antsRaf) {
    cancelAnimationFrame(antsRaf);
  }
  getCanvasContext(overlayCanvas).clearRect(
    0,
    0,
    overlayCanvas.width,
    overlayCanvas.height,
  );
  setToolState(() => ({ antsRaf: 0 }));
}

export function deleteSelection(
  data: DrawToolListenerData<SelectionState>,
): void {
  const { getSharedState, mainCanvas, setSharedState, snapshot } = data;
  const { selection } = getSharedState();

  if (!selection) {
    return;
  }

  snapshot();
  getCanvasContext(mainCanvas).clearRect(
    selection.x,
    selection.y,
    selection.width,
    selection.height,
  );
  setSharedState((state) => ({ ...state, selection: null }));
  clearSelection(data);
}

export function drawAnts(
  overlayCanvas: HTMLCanvasElement,
  selection: Selection | null,
  antOffset: number,
): void {
  const context = getCanvasContext(overlayCanvas);

  context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (!selection) {
    return;
  }

  context.save();
  context.lineWidth = 1;
  context.setLineDash([4, 4]);
  context.lineDashOffset = -antOffset;
  context.strokeStyle = '#ffffff';
  context.strokeRect(
    selection.x + 0.5,
    selection.y + 0.5,
    selection.width - 1,
    selection.height - 1,
  );
  context.lineDashOffset = -antOffset + 4;
  context.strokeStyle = '#000000';
  context.strokeRect(
    selection.x + 0.5,
    selection.y + 0.5,
    selection.width - 1,
    selection.height - 1,
  );
  context.restore();
}

export function selectAll({
  getToolState,
  mainCanvas,
  overlayCanvas,
  setSharedState,
  setToolState,
}: DrawToolListenerData<SelectionState>) {
  const { antsRaf } = getToolState();
  if (antsRaf) cancelAnimationFrame(antsRaf);

  const selection: Selection = {
    height: mainCanvas.height,
    imageData: null,
    width: mainCanvas.width,
    x: 0,
    y: 0,
  };
  setSharedState((state) => ({ ...state, selection }));

  let offset = 0;
  const tick = () => {
    offset = (offset + 0.5) % 8;
    drawAnts(overlayCanvas, selection, offset);
    setToolState((state) => ({
      ...state,
      antsRaf: requestAnimationFrame(tick),
    }));
  };
  tick();
}

function handleMarqueeMove(
  event: MouseEvent,
  { mainCanvas, overlayCanvas }: DrawToolListenerData<SelectionState>,
  marqueeStart: { x: number; y: number },
) {
  const position = getPositionInCanvas(event, mainCanvas);
  const x = Math.min(marqueeStart.x, position.x);
  const y = Math.min(marqueeStart.y, position.y);
  const width = Math.abs(position.x - marqueeStart.x);
  const height = Math.abs(position.y - marqueeStart.y);
  const context = getCanvasContext(overlayCanvas);

  context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  context.lineWidth = 1;
  context.setLineDash([4, 4]);
  context.strokeStyle = '#fff';
  context.strokeRect(x + 0.5, y + 0.5, width, height);
  context.lineDashOffset = 4;
  context.strokeStyle = '#000';
  context.strokeRect(x + 0.5, y + 0.5, width, height);
}

function handleMarqueeUp(
  event: MouseEvent,
  data: DrawToolListenerData<SelectionState>,
  marqueeStart: { x: number; y: number },
) {
  const {
    getToolState,
    mainCanvas,
    overlayCanvas,
    setSharedState,
    setToolState,
  } = data;
  const position = getPositionInCanvas(event, mainCanvas);

  const x = Math.min(marqueeStart.x, position.x);
  const y = Math.min(marqueeStart.y, position.y);
  const width = Math.abs(position.x - marqueeStart.x);
  const height = Math.abs(position.y - marqueeStart.y);

  if (width > 1 && height > 1) {
    const selection = { height, imageData: null, width, x, y };

    setSharedState((state) => ({ ...state, selection }));

    const { antsRaf } = getToolState();

    if (antsRaf) {
      cancelAnimationFrame(antsRaf);
    }

    let offset = 0;

    const tick = () => {
      offset = (offset + 0.5) % 8;
      drawAnts(overlayCanvas, selection, offset);

      setToolState((state) => ({
        ...state,
        antsRaf: requestAnimationFrame(tick),
      }));
    };
    tick();
  } else {
    getCanvasContext(overlayCanvas).clearRect(
      0,
      0,
      overlayCanvas.width,
      overlayCanvas.height,
    );
  }
}

function handleSelect(
  event: MouseEvent,
  data: DrawToolListenerData<SelectionState>,
) {
  if (event.button !== MAIN_BUTTON) {
    return;
  }

  const marqueeStart = getPositionInCanvas(event, data.mainCanvas);

  clearSelection(data);

  function onMouseMove(moveEvent: MouseEvent) {
    handleMarqueeMove(moveEvent, data, marqueeStart);
  }

  function onMouseUp(upEvent: MouseEvent) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    handleMarqueeUp(upEvent, data, marqueeStart);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
