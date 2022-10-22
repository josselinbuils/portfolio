import {
  NormalizedImageFormat,
  PhotometricInterpretation,
  PixelRepresentation,
} from '../constants';
import type { DicomFrame } from '../models/DicomFrame';
import { Frame } from '../models/Frame';
import { V } from './math/Vector';

enum DicomImageFormat {
  Int8 = 'int8',
  Int16 = 'int16',
  RGB = 'rgb',
  UInt8 = 'uint8',
  UInt16 = 'uint16',
}

export function computeFrames(dicomFrames: DicomFrame[]): Frame[] {
  const firstFrame = dicomFrames[0];
  let { spacingBetweenSlices } = firstFrame;

  if (spacingBetweenSlices === undefined) {
    const isComputable =
      dicomFrames.length > 1 &&
      firstFrame.imagePosition !== undefined &&
      dicomFrames[0].imagePosition !== undefined;

    spacingBetweenSlices = isComputable
      ? V(firstFrame.imagePosition as number[]).distance(
          dicomFrames[1].imagePosition as number[]
        )
      : 1;
  }

  return dicomFrames.map((frame, frameIndex) => {
    const dicom = frame;
    const id = `${frame.sopInstanceUID}-${frameIndex}`;
    const { imageFormat, pixelData } = normalizePixelData(frame);
    const {
      dimensionsMm,
      imageCenter,
      imageNormal,
      imageOrientation,
      imagePosition,
      pixelSpacing,
      sliceLocation,
    } = computeFrameGeometry(frame, frameIndex);

    // Removes original pixel data to save space
    delete frame.pixelData;

    return new Frame({
      ...JSON.parse(JSON.stringify(frame)),
      dicom,
      dimensionsMm,
      id,
      imageCenter,
      imageFormat,
      imageNormal,
      imageOrientation,
      imagePosition,
      pixelData,
      pixelSpacing,
      sliceLocation,
      spacingBetweenSlices,
    });
  });
}

function computeFrameGeometry(
  frame: DicomFrame,
  frameIndex: number
): FrameGeometry {
  let { imageOrientation, imagePosition, pixelSpacing, sliceLocation } = frame;

  if (imageOrientation === undefined) {
    imageOrientation = [
      [1, 0, 0],
      [0, 1, 0],
    ];
  }
  if (sliceLocation === undefined) {
    sliceLocation = frameIndex + 0.5;
  }
  if (imagePosition === undefined) {
    imagePosition = [0.5, 0.5, sliceLocation];
  }
  if (pixelSpacing === undefined) {
    pixelSpacing = [1, 1];
  }

  const { columns, rows } = frame;
  const dimensionsMm = [pixelSpacing[0] * columns, pixelSpacing[1] * rows];

  const imageCenter = V(imagePosition)
    .add(V(imageOrientation[0]).mul((columns - 1) * pixelSpacing[0] * 0.5))
    .add(V(imageOrientation[1]).mul((rows - 1) * pixelSpacing[1] * 0.5));

  const imageNormal = V(imageOrientation[0])
    .cross(imageOrientation[1])
    .normalize();

  return {
    dimensionsMm,
    imageCenter,
    imageNormal,
    imageOrientation,
    imagePosition,
    pixelSpacing,
    sliceLocation,
  };
}

function getDicomImageFormat(
  bitsAllocated: number,
  photometricInterpretation: PhotometricInterpretation,
  pixelRepresentation: PixelRepresentation
): DicomImageFormat {
  let format: string;

  if (photometricInterpretation === PhotometricInterpretation.RGB) {
    format = 'rgb';
  } else if ((photometricInterpretation as string).includes('MONOCHROME')) {
    const isSigned = pixelRepresentation === PixelRepresentation.Signed;
    format = `${isSigned ? '' : 'u'}int${bitsAllocated <= 8 ? '8' : '16'}`;
  } else {
    throw new Error(
      `Unsupported photometric interpretation: ${photometricInterpretation}`
    );
  }

  return format as DicomImageFormat;
}

function normalizePixelData(frame: DicomFrame): NormalizedPixelData {
  if (frame.pixelData === undefined) {
    throw new Error('Frame does not contain pixel data');
  }

  const { bitsAllocated, photometricInterpretation, pixelRepresentation } =
    frame;
  const dicomImageFormat = getDicomImageFormat(
    bitsAllocated,
    photometricInterpretation,
    pixelRepresentation
  );
  const rawPixelData = frame.pixelData;
  let imageFormat: NormalizedImageFormat;
  let pixelData: Int16Array | Uint8Array;

  if (dicomImageFormat === DicomImageFormat.RGB) {
    imageFormat = NormalizedImageFormat.RGB;
    pixelData = rawPixelData;
  } else {
    let typedPixelData: ArrayBufferView;

    // Casts pixel data to the right type
    switch (dicomImageFormat) {
      case DicomImageFormat.Int8:
        typedPixelData = new Int8Array(
          rawPixelData.buffer,
          rawPixelData.byteOffset,
          rawPixelData.length
        );
        break;
      case DicomImageFormat.Int16:
        typedPixelData = new Int16Array(
          rawPixelData.buffer,
          rawPixelData.byteOffset,
          rawPixelData.length / 2
        );
        break;
      case DicomImageFormat.UInt8:
        typedPixelData = rawPixelData;
        break;
      case DicomImageFormat.UInt16:
        typedPixelData = new Uint16Array(
          rawPixelData.buffer,
          rawPixelData.byteOffset,
          rawPixelData.length / 2
        );
        break;
      default:
        throw new Error('Unknown dicom format');
    }

    // Normalizes pixel data
    imageFormat = NormalizedImageFormat.Int16;
    pixelData =
      typedPixelData instanceof Int16Array
        ? typedPixelData
        : new Int16Array(typedPixelData as any);
  }

  return { imageFormat, pixelData };
}

interface FrameGeometry {
  dimensionsMm: number[];
  imageCenter: number[];
  imageNormal: number[];
  imageOrientation: number[][];
  imagePosition: number[];
  pixelSpacing: number[];
  sliceLocation: number;
}

interface NormalizedPixelData {
  imageFormat: NormalizedImageFormat;
  pixelData: Int16Array | Uint8Array;
}
