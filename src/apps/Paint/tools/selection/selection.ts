import { faObjectGroup } from '@fortawesome/free-solid-svg-icons/faObjectGroup';

import { MAIN_BUTTON } from '../../constants';
import {
  type ToolDescriptor,
  type ToolListenerData,
} from '../../types/ToolDescriptor';
import { getCanvasContext } from '../../utils/getCanvasContext';
import { getPositionInCanvas } from '../../utils/getPositionInCanvas';
import { useSelectionStore } from './useSelectionStore';
import { clearSelection } from './utils/clearSelection';
import { startAnts } from './utils/startAnts';

export const selectDescriptor = {
  description: 'Marquee select',
  icon: faObjectGroup,
  name: 'select' as const,
  onMouseDown: handleSelect,
} satisfies ToolDescriptor;

function handleMarqueeMove(
  event: MouseEvent,
  mainCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
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
  mainCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  marqueeStart: { x: number; y: number },
) {
  const position = getPositionInCanvas(event, mainCanvas);
  const x = Math.min(marqueeStart.x, position.x);
  const y = Math.min(marqueeStart.y, position.y);
  const width = Math.abs(position.x - marqueeStart.x);
  const height = Math.abs(position.y - marqueeStart.y);

  if (width > 1 && height > 1) {
    useSelectionStore.setState({
      selection: { height, imageData: null, width, x, y },
    });
    startAnts(overlayCanvas);
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
  { mainCanvas, overlayCanvas }: ToolListenerData,
) {
  if (event.button !== MAIN_BUTTON) {
    return;
  }

  const marqueeStart = getPositionInCanvas(event, mainCanvas);

  clearSelection(overlayCanvas);

  function onMouseMove(moveEvent: MouseEvent) {
    handleMarqueeMove(moveEvent, mainCanvas, overlayCanvas, marqueeStart);
  }

  function onMouseUp(upEvent: MouseEvent) {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    handleMarqueeUp(upEvent, mainCanvas, overlayCanvas, marqueeStart);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}
