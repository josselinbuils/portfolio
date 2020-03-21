import { LUTComponent } from '../../../../../interfaces';
import { VOILut } from '../VOILut';

export function loadVOILut(
  lutComponents: LUTComponent[],
  windowWidth: number
): VOILut {
  const table: number[][] = [];

  for (let x = 0; x < windowWidth; x++) {
    const pixelValue = [0, 0, 0];

    lutComponents
      .map(({ color, end, start }) => ({
        color,
        end: Math.round((end / 256) * windowWidth),
        start: Math.round((start / 256) * windowWidth)
      }))
      .filter(({ end, start }) => x - 1 >= start && x <= end)
      .forEach(({ color, end, start }) => {
        const x2 = start + Math.round((end - start) / 2);
        const colorValue = Math.round(
          ((x - start) * (x - end) * 255) / ((x2 - start) * (x2 - end))
        );

        pixelValue[0] += Math.floor((color[0] / 255) * colorValue);
        pixelValue[1] += Math.floor((color[1] / 255) * colorValue);
        pixelValue[2] += Math.floor((color[2] / 255) * colorValue);
      });

    table.push(pixelValue);
  }

  return { table, windowWidth };
}
