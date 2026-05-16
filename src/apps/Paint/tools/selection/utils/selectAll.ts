import { useSelectionStore } from '../useSelectionStore';
import { startAnts } from './startAnts';

export function selectAll(
  mainCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
) {
  useSelectionStore.setState({
    selection: {
      height: mainCanvas.height,
      imageData: null,
      width: mainCanvas.width,
      x: 0,
      y: 0,
    },
  });
  startAnts(overlayCanvas);
}
