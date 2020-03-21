import { NormalizedImageFormat } from '../constants';
import { SharedProperties } from '../interfaces';
import { Frame, Volume } from '../models';
import { V } from './math';

export function computeVolume(
  frames: Frame[],
  sharedProperties: SharedProperties
): Volume | undefined {
  const isVolume =
    frames.length > 30 &&
    frames.every(frame => {
      return (
        frame.imageFormat === NormalizedImageFormat.Int16 &&
        frame.dicom.imageOrientation !== undefined &&
        frame.dicom.imagePosition !== undefined &&
        frame.dicom.pixelSpacing !== undefined
      );
    });

  if (!isVolume) {
    return undefined;
  }

  const { voxelSpacing } = sharedProperties;
  const { columns, imageOrientation, imageNormal, rows } = frames[0];

  const dimensionsVoxels = [columns, rows, frames.length];
  const firstVoxelCenter = frames[0].imagePosition;
  const orientation = [...imageOrientation, imageNormal];
  const displayRatio = voxelSpacing.map(v => v / voxelSpacing[1]);
  const dimensionsMm = dimensionsVoxels.map((dim, i) => dim * voxelSpacing[i]);
  const orientedDimensionsMm = orientation.map((orient, index) =>
    V(orient).mul(dimensionsMm[index])
  );
  const orientedDimensionsVoxels = orientation.map((orient, index) =>
    V(orient).mul(dimensionsVoxels[index])
  );

  const getCorner = (x: number, y: number, z: number): number[] => {
    return V(firstVoxelCenter)
      .add(V(orientedDimensionsMm[0]).mul(x))
      .add(V(orientedDimensionsMm[1]).mul(y))
      .add(V(orientedDimensionsMm[2]).mul(z))
      .sub([
        V(voxelSpacing)
          .mul(x)
          .dot(orientation[0]),
        V(voxelSpacing)
          .mul(y)
          .dot(orientation[1]),
        V(voxelSpacing)
          .mul(z)
          .dot(orientation[2])
      ]);
  };

  const corners = {
    x0y0z0: getCorner(0, 0, 0),
    x1y0z0: getCorner(1, 0, 0),
    x1y1z0: getCorner(1, 1, 0),
    x0y1z0: getCorner(0, 1, 0),
    x0y0z1: getCorner(0, 0, 1),
    x1y0z1: getCorner(1, 0, 1),
    x1y1z1: getCorner(1, 1, 1),
    x0y1z1: getCorner(0, 1, 1)
  };

  const center = V(firstVoxelCenter)
    .add(V(orientedDimensionsMm[0]).mul(0.5))
    .add(V(orientedDimensionsMm[1]).mul(0.5))
    .add(V(orientedDimensionsMm[2]).mul(0.5))
    .sub(V(voxelSpacing).mul(0.5));

  return new Volume({
    center,
    dimensionsMm,
    dimensionsVoxels,
    displayRatio,
    corners,
    firstVoxelCenter,
    orientation,
    orientedDimensionsMm,
    orientedDimensionsVoxels,
    voxelSpacing
  });
}
