import { VOILut } from '../../../../../interfaces';

export function getDefaultVOILut(windowWidth: number): VOILut {
  const table: number[] = [];

  for (let i = 0; i < windowWidth; i++) {
    table[i] = Math.floor((i / windowWidth) * 256);
  }

  return { table, windowWidth };
}
