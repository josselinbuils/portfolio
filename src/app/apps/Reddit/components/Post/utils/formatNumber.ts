export function formatNumber(num: number): string {
  return num < 1000 ? num.toString() : `${Math.floor(num / 100) / 10}k`;
}
