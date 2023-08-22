import { type SharedProperties } from '../interfaces/SharedProperties';
import { type Frame } from '../models/Frame';
import { Volume } from '../models/Volume';
import { isVolume } from './isVolume';
import { V } from './math/Vector';

export function computeVolume(
  frames: Frame[],
  sharedProperties: SharedProperties,
): Volume | undefined {
  if (!isVolume(frames)) {
    return undefined;
  }

  const { voxelSpacing } = sharedProperties;
  const { columns, imageOrientation, imageNormal, rows } = frames[0];

  const dimensionsVoxels = [columns, rows, frames.length];
  const firstVoxelCenter = frames[0].imagePosition;
  const orientation = [...imageOrientation, imageNormal];
  const displayRatio = voxelSpacing.map((v) => v / voxelSpacing[1]);
  const dimensionsMm = dimensionsVoxels.map((dim, i) => dim * voxelSpacing[i]);
  const orientedDimensionsMm = orientation.map((orient, index) =>
    V(orient).scale(dimensionsMm[index]),
  );
  const orientedDimensionsVoxels = orientation.map((orient, index) =>
    V(orient).scale(dimensionsVoxels[index]),
  );

  const getCorner = (x: number, y: number, z: number): number[] =>
    V(firstVoxelCenter)
      .add(V(orientedDimensionsMm[0]).scale(x))
      .add(V(orientedDimensionsMm[1]).scale(y))
      .add(V(orientedDimensionsMm[2]).scale(z))
      .sub([
        V(voxelSpacing).scale(x).dot(orientation[0]),
        V(voxelSpacing).scale(y).dot(orientation[1]),
        V(voxelSpacing).scale(z).dot(orientation[2]),
      ]);

  const corners = {
    x0y0z0: getCorner(0, 0, 0),
    x1y0z0: getCorner(1, 0, 0),
    x1y1z0: getCorner(1, 1, 0),
    x0y1z0: getCorner(0, 1, 0),
    x0y0z1: getCorner(0, 0, 1),
    x1y0z1: getCorner(1, 0, 1),
    x1y1z1: getCorner(1, 1, 1),
    x0y1z1: getCorner(0, 1, 1),
  };

  const center = V(firstVoxelCenter)
    .add(V(orientedDimensionsMm[0]).scale(0.5))
    .add(V(orientedDimensionsMm[1]).scale(0.5))
    .add(V(orientedDimensionsMm[2]).scale(0.5))
    .sub(V(voxelSpacing).scale(0.5));

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
    voxelSpacing,
  });
}
