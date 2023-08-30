import { type Viewport } from '../../models/Viewport';
import { changePointSpace } from '../changePointSpace';
import { V } from '../math/Vector';
import { isImageCentered } from './utils/isImageCentered';

const ZOOM_LIMIT = 0.07;
const ZOOM_MAX = 5;
const ZOOM_MIN = 0.3;
const ZOOM_SENSIBILITY = 5000;

export function startZoom(
  viewport: Viewport,
  downEvent: MouseEvent,
  onZoom: (values: { zoom: number }) => void,
): (moveEvent: MouseEvent) => void {
  const { camera, dataset, height } = viewport;
  const { baseFieldOfView } = camera;
  const startY = downEvent.clientY;
  const startFOV = camera.fieldOfView;
  const direction = camera.getDirection();
  const imageCenter = changePointSpace(
    viewport.dataset.volume!.center,
    viewport.dataset,
    viewport,
  );

  return (moveEvent: MouseEvent) => {
    const maxFOV = baseFieldOfView / ZOOM_MIN;
    const minFOV = baseFieldOfView / ZOOM_MAX;

    const zoomSensibility =
      (ZOOM_SENSIBILITY * Math.max(startFOV - minFOV, (maxFOV - minFOV) / 10)) /
      (maxFOV - minFOV);

    const newFieldOfView =
      startFOV + ((moveEvent.clientY - startY) * zoomSensibility) / height;

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

    // Keeps image center at the same position on the viewport
    const newImageCenter = changePointSpace(
      viewport.dataset.volume!.center,
      viewport.dataset,
      viewport,
    );
    const newLookPointViewport = [
      newImageCenter[0] + viewport.width / 2 - imageCenter[0],
      newImageCenter[1] + viewport.height / 2 - imageCenter[1],
      0,
    ];
    camera.lookPoint = changePointSpace(
      newLookPointViewport,
      viewport,
      dataset,
    );
    camera.eyePoint = V(camera.lookPoint).sub(direction);

    onZoom({ zoom: viewport.getImageZoom() });
  };
}
