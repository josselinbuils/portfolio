import { type VOILUT } from '@/apps/DICOMViewer/interfaces/VOILUT';

export function getDefaultVOILUT(windowWidth: number): VOILUT {
  const table: number[][] = [];

  for (let i = 0; i < windowWidth; i++) {
    const value = Math.floor((i / windowWidth) * 256);
    table[i] = [value, value, value];
  }

  return { table, windowWidth };
}
