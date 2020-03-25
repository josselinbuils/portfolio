export function hexToRGB(color: string): number[] | undefined {
  return color
    ?.slice(1)
    ?.match(/\w\w/g)
    ?.map((v) => parseInt(v, 16));
}
