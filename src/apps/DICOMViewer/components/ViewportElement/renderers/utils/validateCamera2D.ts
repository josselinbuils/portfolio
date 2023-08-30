import { type Camera } from '@/apps/DICOMViewer/models/Camera';
import { type Frame } from '@/apps/DICOMViewer/models/Frame';
import { V } from '@/apps/DICOMViewer/utils/math/Vector';

export function validateCamera2D(frame: Frame, camera: Camera): void {
  const isDirectionValid =
    Math.abs(V(camera.getDirection()).angle(frame.imageNormal)) <
    Number.EPSILON;

  if (!isDirectionValid) {
    throw new Error('Camera direction is not collinear with the frame normal');
  }

  // Frame vertical axis is inverted compared to axial view
  const angle =
    Math.abs(V(camera.upVector).angle(frame.imageOrientation[1])) - Math.PI;
  const isUpVectorValid = angle < Number.EPSILON;

  if (!isUpVectorValid) {
    throw new Error(
      `Up vector is not collinear to the frame orientation (${angle} should be < ${Number.EPSILON})`,
    );
  }

  const cameraFrameDistance = Math.abs(
    V(camera.lookPoint).sub(frame.imagePosition).dot(camera.getDirection()),
  );

  if (cameraFrameDistance > frame.spacingBetweenSlices) {
    throw new Error(
      `lookPoint shall be on the frame (${cameraFrameDistance}mm)`,
    );
  }
}
