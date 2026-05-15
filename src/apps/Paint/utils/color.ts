export function colorAt(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  canvasWidth: number,
): [number, number, number, number] {
  const pixelIndex = (y * canvasWidth + x) * 4;
  return [
    data[pixelIndex],
    data[pixelIndex + 1],
    data[pixelIndex + 2],
    data[pixelIndex + 3],
  ];
}

export function colorDist(a: number[], b: number[]): number {
  return (
    Math.abs(a[0] - b[0]) +
    Math.abs(a[1] - b[1]) +
    Math.abs(a[2] - b[2]) +
    Math.abs(a[3] - b[3])
  );
}

export function hexToRgba(hex: string): [number, number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? [
        parseInt(match[1], 16),
        parseInt(match[2], 16),
        parseInt(match[3], 16),
        255,
      ]
    : [0, 0, 0, 255];
}
