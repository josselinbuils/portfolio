import { type ToolDescriptor } from '../types/ToolDescriptor';
import { eraserDescriptor, pencilDescriptor } from './draw/eraserAndPencil';
import { polygonDescriptor, starDescriptor } from './draw/polygonStar';
import {
  circleDescriptor,
  rectDescriptor,
  rectRoundDescriptor,
} from './draw/shapes';
import { paintBucketDescriptor } from './paintBucket';
import { colorPickerDescriptor } from './palette/colorPicker';
import { lassoDescriptor } from './selection/lasso';
import { magicWandDescriptor } from './selection/magicWand';
import { selectDescriptor } from './selection/selection';
import { textDescriptor } from './text';

export const tools = [
  selectDescriptor,
  lassoDescriptor,
  magicWandDescriptor,
  pencilDescriptor,
  eraserDescriptor,
  rectDescriptor,
  rectRoundDescriptor,
  circleDescriptor,
  polygonDescriptor,
  starDescriptor,
  textDescriptor,
  paintBucketDescriptor,
  colorPickerDescriptor,
] satisfies ToolDescriptor[];

export type Tool = (typeof tools)[number]['name'];
