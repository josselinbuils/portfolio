import type { DrawToolListenerData } from '@/apps/Paint/types/DrawToolDescriptor';

import { getCanvasContext } from '../../../utils/getCanvasContext';
import { useSelectionStore } from '../useSelectionStore';

export function deleteSelection(data: DrawToolListenerData): void {
  const { mainCanvas, snapshot } = data;
  const { selection } = useSelectionStore.getState();

  if (!selection) {
    return;
  }

  snapshot();

  const context = getCanvasContext(mainCanvas);

  if (selection.mask) {
    const imageData = context.getImageData(
      0,
      0,
      mainCanvas.width,
      mainCanvas.height,
    );
    for (let pixelIndex = 0; pixelIndex < selection.mask.length; pixelIndex++) {
      if (selection.mask[pixelIndex]) {
        imageData.data[pixelIndex * 4 + 3] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
  } else {
    context.clearRect(
      selection.x,
      selection.y,
      selection.width,
      selection.height,
    );
  }
}
