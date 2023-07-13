export function applyPolynomialInterpolation(
  x1: number,
  x3: number,
  y2: number,
  x: number,
): number {
  const x2 = x1 + Math.round((x3 - x1) / 2);
  return Math.round(((x - x1) * (x - x3) * y2) / ((x2 - x1) * (x2 - x3)));
}
