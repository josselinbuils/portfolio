import { getCanvasContext } from '../../../utils/getCanvasContext';
import { type Selection, useSelectionStore } from '../useSelectionStore';

let antsRaf: number = 0;

export function startAnts(overlayCanvas: HTMLCanvasElement) {
  if (antsRaf) {
    cancelAnimationFrame(antsRaf);
  }
  let offset = 0;

  const tick = () => {
    const { selection } = useSelectionStore.getState();

    if (!selection) {
      cancelAnimationFrame(antsRaf);
      antsRaf = 0;
      return;
    }

    offset = (offset + 0.5) % 8;

    drawAnts(overlayCanvas, selection, offset);
    antsRaf = requestAnimationFrame(tick);
  };
  tick();
}

function drawAnts(
  overlayCanvas: HTMLCanvasElement,
  selection: Selection,
  antOffset: number,
): void {
  const context = getCanvasContext(overlayCanvas);

  context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  context.save();
  context.lineWidth = 1;
  context.setLineDash([4, 4]);

  if (selection.boundary) {
    context.lineDashOffset = -antOffset;
    context.strokeStyle = '#ffffff';
    context.stroke(selection.boundary);
    context.lineDashOffset = -antOffset + 4;
    context.strokeStyle = '#000000';
    context.stroke(selection.boundary);
  } else {
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
  }

  context.restore();
}
