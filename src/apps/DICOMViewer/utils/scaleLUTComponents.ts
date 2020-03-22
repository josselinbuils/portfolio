import { LUTComponent } from '~/apps/DICOMViewer/interfaces';

const BASE_SIZE = 256;

export function scaleLUTComponents(
  lutComponents: LUTComponent[],
  newSize: number
): LUTComponent[] {
  return lutComponents.map(({ end, start, ...others }) => ({
    ...others,
    end: Math.round((end / BASE_SIZE) * newSize),
    start: Math.round((start / BASE_SIZE) * newSize)
  }));
}
