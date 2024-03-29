import { V } from '../utils/math/Vector';
import { getLinePlaneIntersection } from '../utils/math/getLinePlaneIntersection';
import { Model } from './Model';

const MANDATORY_FIELDS: readonly (keyof Volume)[] = [
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

  constructor(config: { [key: string]: any }) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
  }

  getOrientedDimensionMm(axe: number[]): number {
    return this.orientedDimensionsMm.reduce(
      (sum, dimensionVector) => sum + Math.abs(V(dimensionVector).dot(axe)),
      0,
    );
  }

  getOrientedDimensionVoxels(axe: number[]): number {
    return this.orientedDimensionsVoxels.reduce(
      (sum, dimensionVector) => sum + Math.abs(V(dimensionVector).dot(axe)),
      0,
    );
  }

  /**
   * @param plane 3 points representing the plane.
   */
  getIntersections(plane: number[][]): number[][] {
    const lines: (keyof typeof this.corners)[][] = [
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
      const a = this.corners[keyA];
      const b = this.corners[keyB];
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

  /**
   * @param plane 3 points representing the plane.
   */
  getProjections(plane: number[][]): number[][] {
    const planeNormal = V(plane[1])
      .sub(plane[0])
      .cross(V(plane[2]).sub(plane[0]));

    return Object.values(this.corners).map((corner) => {
      const viewportToCornerDistance = V(corner).sub(plane[0]).dot(planeNormal);
      return V(corner).add(V(planeNormal).scale(viewportToCornerDistance));
    });
  }
}
