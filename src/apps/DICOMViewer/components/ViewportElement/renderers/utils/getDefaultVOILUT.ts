import { type VOILUT } from '@/apps/DICOMViewer/interfaces/VOILUT';

export function getDefaultVOILUT(windowWidth: number, background = 0): VOILUT {
  const table: number[][] = [];

  for (let i = 0; i < windowWidth; i++) {
    const value = Math.max(Math.floor((i / windowWidth) * 256), background);
    table[i] = [value, value, value];
  }

  return { table, windowWidth };
}
