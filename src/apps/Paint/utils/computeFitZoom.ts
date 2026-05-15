import { ZOOM_LEVELS } from '@/apps/Paint/constants';

export function computeFitZoom(
  viewport: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
): number {
  if (!viewport) {
    return 1;
  }

  const computedStyle = window.getComputedStyle(viewport);

  const availableWidth =
    viewport.clientWidth -
    parseFloat(computedStyle.paddingLeft) -
    parseFloat(computedStyle.paddingRight);

  const availableHeight =
    viewport.clientHeight -
    parseFloat(computedStyle.paddingTop) -
    parseFloat(computedStyle.paddingBottom);

  if (availableWidth <= 0 || availableHeight <= 0) {
    return 1;
  }

  const fit = Math.min(
    availableWidth / canvasWidth,
    availableHeight / canvasHeight,
    1,
  );

  return Math.max(
    ZOOM_LEVELS[0],
    Math.min(ZOOM_LEVELS[ZOOM_LEVELS.length - 1], fit),
  );
}
