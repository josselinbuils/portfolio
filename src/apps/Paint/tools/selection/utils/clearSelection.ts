import { getCanvasContext } from '../../../utils/getCanvasContext';
import { useSelectionStore } from '../useSelectionStore';

export function clearSelection(overlayCanvas: HTMLCanvasElement): void {
  getCanvasContext(overlayCanvas).clearRect(
    0,
    0,
    overlayCanvas.width,
    overlayCanvas.height,
  );
  useSelectionStore.setState({ selection: null });
}
