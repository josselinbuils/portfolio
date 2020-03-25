export function rgbToHex(color: number[]): string {
  return `#${((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2])
    .toString(16)
    .slice(1)}`;
}
