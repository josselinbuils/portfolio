import { VOILUT } from '~/apps/DICOMViewer/interfaces/VOILUT';

export function getDefaultVOILUT(windowWidth: number): VOILUT {
  const table: number[] = [];

  for (let i = 0; i < windowWidth; i++) {
    table[i] = Math.floor((i / windowWidth) * 256);
  }

  return { table, windowWidth };
}
