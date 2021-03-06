import { Viewport } from '../../models/Viewport';
import { isImageCentered } from './utils/isImageCentered';

const ZOOM_LIMIT = 0.07;
const ZOOM_MAX = 5;
const ZOOM_MIN = 0.2;
const ZOOM_SENSIBILITY = 1000;

export function startZoom(
  viewport: Viewport,
  downEvent: MouseEvent,
  onZoom: (values: { zoom: number }) => void
): (moveEvent: MouseEvent) => void {
  const { camera, height } = viewport;
  const { baseFieldOfView } = camera;
  const startY = downEvent.clientY;
  const startFOV = camera.fieldOfView;

  return (moveEvent: MouseEvent) => {
    const maxFOV = baseFieldOfView / ZOOM_MIN;
    const minFOV = baseFieldOfView / ZOOM_MAX;
    const newFieldOfView =
      startFOV + ((moveEvent.clientY - startY) * ZOOM_SENSIBILITY) / height;

    camera.fieldOfView = Math.max(Math.min(newFieldOfView, maxFOV), minFOV);

    const zoom = viewport.getImageZoom();

    // Helps to set zoom at 1
    if (Math.abs(zoom - 1) < ZOOM_LIMIT) {
      camera.fieldOfView *= zoom;
    }

    // Helps to fit the viewport of image is centered
    if (
      isImageCentered(viewport) &&
      Math.abs(baseFieldOfView / camera.fieldOfView - 1) < ZOOM_LIMIT
    ) {
      camera.fieldOfView = baseFieldOfView;
    }

    onZoom({ zoom: viewport.getImageZoom() });
  };
}
