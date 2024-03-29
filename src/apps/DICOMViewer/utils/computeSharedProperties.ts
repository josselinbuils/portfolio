import { type SharedProperties } from '../interfaces/SharedProperties';
import { type Frame } from '../models/Frame';

export function computeSharedProperties(frames: Frame[]): SharedProperties {
  const { pixelSpacing, spacingBetweenSlices } = frames[0];
  const voxelSpacing = [...pixelSpacing, spacingBetweenSlices];
  return { voxelSpacing };
}
