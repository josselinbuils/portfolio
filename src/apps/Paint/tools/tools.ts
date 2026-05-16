import { type DrawToolDescriptor } from '../types/DrawToolDescriptor';
import { eraserDescriptor, pencilDescriptor } from './draw/eraserAndPencil';
import {
  circleDescriptor,
  rectDescriptor,
  rectRoundDescriptor,
} from './draw/shapes';
import { paintBucketDescriptor } from './paintBucket';
import { colorPickerDescriptor } from './palette/colorPicker';
import { magicWandDescriptor } from './selection/magicWand';
import { selectDescriptor } from './selection/selection';
import { textDescriptor } from './text';

export const tools = [
  selectDescriptor,
  magicWandDescriptor,
  pencilDescriptor,
  eraserDescriptor,
  rectDescriptor,
  rectRoundDescriptor,
  circleDescriptor,
  textDescriptor,
  paintBucketDescriptor,
  colorPickerDescriptor,
] satisfies DrawToolDescriptor[];

export type DrawTool = (typeof tools)[number]['name'];
