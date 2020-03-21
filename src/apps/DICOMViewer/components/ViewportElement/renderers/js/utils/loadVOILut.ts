import { LUTColor } from '../../../../../constants';
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
      .filter(({ start, end }) => x - 1 >= start && x <= end)
      .forEach(({ color, end, start }) => {
        const x2 = start + Math.round((end - start) / 2);
        const colorValue = Math.round(
          ((x - start) * (x - end) * 255) / ((x2 - start) * (x2 - end))
        );

        switch (color) {
          case LUTColor.Blue:
            pixelValue[2] += colorValue;
            break;

          case LUTColor.Green:
            pixelValue[1] += colorValue;
            break;

          case LUTColor.Red:
            pixelValue[0] += colorValue;
        }
      });

    table.push(pixelValue);
  }

  return { table, windowWidth };
}
