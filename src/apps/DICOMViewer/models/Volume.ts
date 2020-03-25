import { getLinePlaneIntersection, V } from '../utils/math';
import { Model } from './Model';

const MANDATORY_FIELDS = [
  'center',
  'corners',
  'dimensionsMm',
  'dimensionsVoxels',
  'displayRatio',
  'firstVoxelCenter',
  'orientation',
  'orientedDimensionsMm',
  'orientedDimensionsVoxels',
  'voxelSpacing',
];

// All vectors are in LPS space
export class Volume extends Model {
  center!: number[];
  corners!: {
    x0y0z0: number[];
    x1y0z0: number[];
    x1y1z0: number[];
    x0y1z0: number[];
    x0y0z1: number[];
    x1y0z1: number[];
    x1y1z1: number[];
    x0y1z1: number[];
  };
  // mm
  dimensionsMm!: number[];
  // Voxels
  dimensionsVoxels!: number[];
  displayRatio!: number[];
  firstVoxelCenter!: number[];
  // Unit vectors
  orientation!: number[][];
  // Orientation vectors scaled with volume dimensions in mm
  orientedDimensionsMm!: number[][];
  // Orientation vectors scaled with volume dimensions in voxels
  orientedDimensionsVoxels!: number[][];
  // mm
  voxelSpacing!: number[];

  constructor(config: object) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
  }

  getOrientedDimensionMm(axe: number[]): number {
    return Math.max(
      ...this.orientedDimensionsMm.map((dimensionVector) =>
        Math.abs(V(dimensionVector).dot(axe))
      )
    );
  }

  /**
   * @param plane 3 points representing the plane.
   */
  getIntersections(plane: number[][]): number[][] {
    const lines = [
      ['x0y0z0', 'x1y0z0'],
      ['x1y0z0', 'x1y1z0'],
      ['x1y1z0', 'x0y1z0'],
      ['x0y1z0', 'x0y0z0'],
      ['x0y0z1', 'x1y0z1'],
      ['x1y0z1', 'x1y1z1'],
      ['x1y1z1', 'x0y1z1'],
      ['x0y1z1', 'x0y0z1'],
      ['x0y0z0', 'x0y0z1'],
      ['x1y0z0', 'x1y0z1'],
      ['x1y1z0', 'x1y1z1'],
      ['x0y1z0', 'x0y1z1'],
    ];
    const planeNormal = V(plane[1])
      .sub(plane[0])
      .cross(V(plane[2]).sub(plane[0]));
    const intersections: number[][] = [];

    for (const [keyA, keyB] of lines) {
      const a = (this.corners as any)[keyA];
      const b = (this.corners as any)[keyB];
      const viewportToADistance = V(a).sub(plane[0]).dot(planeNormal);
      const viewportToBDistance = V(b).sub(plane[0]).dot(planeNormal);
      const crossesViewport =
        Math.sign(viewportToADistance) !== Math.sign(viewportToBDistance);

      if (crossesViewport) {
        intersections.push(getLinePlaneIntersection([a, b], plane));
      }
    }
    return intersections;
  }
}
