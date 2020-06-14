export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  if (num < 10000) {
    return `${Math.floor(num / 100) / 10}k`;
  }
  return `${Math.floor(num / 1000)}k`;
}
