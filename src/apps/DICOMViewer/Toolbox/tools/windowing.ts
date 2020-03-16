import { Viewport } from '../../models';
import { ToolMoveListener } from '../Toolbox';

const WINDOW_LEVEL_SENSIBILITY = 3;
const WINDOW_WIDTH_SENSIBILITY = 5;
const WINDOW_WIDTH_MIN = 1;

export function startWindowing(
  viewport: Viewport,
  downEvent: MouseEvent
): ToolMoveListener {
  const startX = downEvent.clientX;
  const startY = downEvent.clientY;

  const startWindowWidth = viewport.windowWidth;
  const startWindowCenter = viewport.windowCenter;

  return (moveEvent: MouseEvent) => {
    const deltaWindowWidth =
      (moveEvent.clientX - startX) * WINDOW_WIDTH_SENSIBILITY;
    const windowWidth = Math.max(
      startWindowWidth + deltaWindowWidth,
      WINDOW_WIDTH_MIN
    );
    const windowCenter =
      startWindowCenter -
      (moveEvent.clientY - startY) * WINDOW_LEVEL_SENSIBILITY;
    viewport.windowWidth = windowWidth;
    viewport.windowCenter = windowCenter;
    viewport.updateAnnotations({ windowCenter, windowWidth });
  };
}
