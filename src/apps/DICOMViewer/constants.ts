import { type ViewType } from './interfaces/ViewType';

export const VIEW_TYPES_3D: readonly ViewType[] = ['bones', 'skin', 'tissues'];

export const VIEW_TYPES_WITH_ROTATION: readonly ViewType[] = [
  ...VIEW_TYPES_3D,
  'oblique',
];
