import { CoordinateSpace } from '../interfaces';
import { M3, M4, V } from './math';

let cache: {
  [key: string]: { from: number[][]; to: number[][] };
} = {};

export function changePointSpace(
  point: number[],
  originalSpace: CoordinateSpace,
  finalSpace: CoordinateSpace
): number[] {
  const originalSpaceToWorldMatrix = getWorldTransformationMatrix(originalSpace)
    .to;
  const worldPoint = M4(originalSpaceToWorldMatrix).mulVec([...point, 1]);
  const worldToFinalSpaceMatrix = getWorldTransformationMatrix(finalSpace).from;
  return M4(worldToFinalSpaceMatrix)
    .mulVec(worldPoint)
    .slice(0, 3);
}

function getWorldTransformationMatrix(
  space: CoordinateSpace
): { from: number[][]; to: number[][] } {
  const basis = space.getWorldBasis();
  const origin = space.getWorldOrigin();
  const cacheKey = `${basis}${origin}`;

  if (cache[cacheKey] === undefined) {
    // Translation
    const translationVector = V(M3(basis).mulVec(origin)).neg();

    const from = [
      [...basis[0], translationVector[0]],
      [...basis[1], translationVector[1]],
      [...basis[2], translationVector[2]],
      [0, 0, 0, 1]
    ];
    const to = M4(from).inv();

    if (Object.keys(cache).length > 10) {
      cache = {};
    }
    cache[cacheKey] = { from, to };
  }

  return cache[cacheKey];
}
