import { type DrawToolDescriptor } from '../types/DrawToolDescriptor';
import { colorPickerDescriptor } from './colorPicker';
import { eraserDescriptor, pencilDescriptor } from './eraserAndPencil';
import { paintBucketDescriptor } from './paintBucket';
import { selectDescriptor } from './selection';
import {
  circleDescriptor,
  rectDescriptor,
  rectRoundDescriptor,
} from './shapes';
import { textDescriptor } from './text';

export const tools = [
  selectDescriptor,
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
