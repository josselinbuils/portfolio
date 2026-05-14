import { type DrawToolDescriptor } from '../types/DrawToolDescriptor';
import { colorPickerDescriptor } from './colorPicker';
import { eraserDescriptor, pencilDescriptor } from './eraserAndPencil';
import { magicWandDescriptor } from './magicWand';
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
