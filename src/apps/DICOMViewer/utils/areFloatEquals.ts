export function areFloatEquals(first: number, second: number): boolean {
  return Math.round(first * 1e5) === Math.round(second * 1e5);
}
