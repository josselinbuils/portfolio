import { useSelectionStore } from '../useSelectionStore';
import { startAnts } from './startAnts';

export function selectAll(
  mainCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
) {
  const { antsRaf } = useSelectionStore.getState();

  if (antsRaf) {
    cancelAnimationFrame(antsRaf);
  }

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
