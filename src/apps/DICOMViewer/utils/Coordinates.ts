import { M3, M4, V } from '../math';
import { CoordinateSpace } from '../models';

export class Coordinates {
  private static cache: {
    [key: string]: { from: number[][]; to: number[][] };
  } = {};

  static convert(
    point: number[],
    originalSpace: CoordinateSpace,
    finalSpace: CoordinateSpace
  ): number[] {
    const originalSpaceToWorldMatrix = this.getWorldTransformationMatrix(
      originalSpace
    ).to;
    const worldPoint = M4(originalSpaceToWorldMatrix).mulVec([...point, 1]);
    const worldToFinalSpaceMatrix = this.getWorldTransformationMatrix(
      finalSpace
    ).from;
    return M4(worldToFinalSpaceMatrix)
      .mulVec(worldPoint)
      .slice(0, 3);
  }

  private static getWorldTransformationMatrix(
    space: CoordinateSpace
  ): { from: number[][]; to: number[][] } {
    const basis = space.getWorldBasis();
    const origin = space.getWorldOrigin();
    const cacheKey = JSON.stringify([basis, origin]);

    if (this.cache[cacheKey] === undefined) {
      // Translation
      const translationVector = V(M3(basis).mulVec(origin)).neg();

      const from = [
        [...basis[0], translationVector[0]],
        [...basis[1], translationVector[1]],
        [...basis[2], translationVector[2]],
        [0, 0, 0, 1]
      ];
      const to = M4(from).inv();

      if (Object.values(this.cache).length > 10) {
        this.cache = {};
      }
      this.cache[cacheKey] = { from, to };
    }

    return this.cache[cacheKey];
  }
}
