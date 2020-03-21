import { VOILut } from '../VOILut';

export function getVOILut(windowWidth: number): VOILut {
  const table: number[] = [];

  for (let i = 0; i < windowWidth; i++) {
    table[i] = Math.floor((i / windowWidth) * 256);
  }

  return { table, windowWidth };
}
