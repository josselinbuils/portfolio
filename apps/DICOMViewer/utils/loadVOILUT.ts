import { type LUTComponent } from '../interfaces/LUTComponent';
import { type VOILUT } from '../interfaces/VOILUT';
import { applyPolynomialInterpolation } from './math/applyPolynomialInterpolation';
import { scaleLUTComponents } from './scaleLUTComponents';

export function loadVOILUT(
  lutComponents: LUTComponent[],
  windowWidth: number,
): VOILUT {
  const table: number[][] = [];

  for (let x = 0; x < windowWidth; x++) {
    const pixelValue = [0, 0, 0];

    scaleLUTComponents(lutComponents, windowWidth)
      .filter(({ end, start }) => x - 1 >= start && x <= end)
      .forEach(({ color, end, start }) => {
        const colorValue = applyPolynomialInterpolation(start, end, 255, x);

        pixelValue[0] = Math.min(
          pixelValue[0] + Math.floor((color[0] / 255) * colorValue),
          255,
        );
        pixelValue[1] = Math.min(
          pixelValue[1] + Math.floor((color[1] / 255) * colorValue),
          255,
        );
        pixelValue[2] = Math.min(
          pixelValue[2] + Math.floor((color[2] / 255) * colorValue),
          255,
        );
      });

    table.push(pixelValue);
  }

  return { table, windowWidth };
}
