import { NormalizedImageFormat } from '../constants';
import { Frame } from '../models/Frame';

export function isVolume(frames: Frame[]): boolean {
  return (
    frames.length > 30 &&
    frames.every((frame) => {
      return (
        frame.imageFormat === NormalizedImageFormat.Int16 &&
        frame.dicom.imageOrientation !== undefined &&
        frame.dicom.imagePosition !== undefined &&
        frame.dicom.pixelSpacing !== undefined
      );
    })
  );
}
