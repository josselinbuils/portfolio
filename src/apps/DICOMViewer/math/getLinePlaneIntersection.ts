import { M4 } from './Matrix4';

export function getLinePlaneIntersection(
  line: number[][],
  plane: number[][]
): number[] {
  const [[x1, y1, z1], [x2, y2, z2], [x3, y3, z3]] = plane;
  const [[x4, y4, z4], [x5, y5, z5]] = line;

  const m1 = [
    [1, 1, 1, 1],
    [x1, x2, x3, x4],
    [y1, y2, y3, y4],
    [z1, z2, z3, z4]
  ];

  const m2 = [
    [1, 1, 1, 0],
    [x1, x2, x3, x5 - x4],
    [y1, y2, y3, y5 - y4],
    [z1, z2, z3, z5 - z4]
  ];

  const t = -M4(m1).det() / M4(m2).det();
  const x = x4 + (x5 - x4) * t;
  const y = y4 + (y5 - y4) * t;
  const z = z4 + (z5 - z4) * t;

  return [x, y, z];
}
