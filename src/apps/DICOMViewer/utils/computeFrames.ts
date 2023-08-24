import {
  type DicomFrame,
  type PhotometricInterpretation,
  PixelRepresentation,
} from '../models/DicomFrame';
import { Frame } from '../models/Frame';
import { V } from './math/Vector';

type DicomImageFormat = 'int8' | 'int16' | 'rgb' | 'uint8' | 'uint16';

interface FrameGeometry {
  dimensionsMm: number[];
  imageCenter: number[];
  imageNormal: number[];
  imageOrientation: number[][];
  imagePosition: number[];
  pixelSpacing: number[];
  sliceLocation: number;
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
          dicomFrames[1].imagePosition as number[],
        )
      : 1;
  }
  // spacingBetweenSlices *= 3;

  return dicomFrames.map((frame, frameIndex) => {
    const dicom = frame;
    const id = `${frame.sopInstanceUID}-${frameIndex}`;
    const pixelData = normalizePixelData(frame);
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
  frameIndex: number,
): FrameGeometry {
  let { imageOrientation, imagePosition, pixelSpacing, sliceLocation } = frame;

  if (imageOrientation === undefined) {
    imageOrientation = [
      [1, 0, 0],
      [0, 1, 0],
    ];
  }
  if (sliceLocation === undefined) {
    sliceLocation =
      imagePosition !== undefined ? imagePosition[2] : frameIndex + 0.5;
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
    .add(V(imageOrientation[0]).scale((columns - 1) * pixelSpacing[0] * 0.5))
    .add(V(imageOrientation[1]).scale((rows - 1) * pixelSpacing[1] * 0.5));

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
  pixelRepresentation: PixelRepresentation,
): DicomImageFormat {
  let format: string;

  if ((photometricInterpretation as string).startsWith('MONOCHROME')) {
    const isSigned = pixelRepresentation === PixelRepresentation.Signed;
    format = `${isSigned ? '' : 'u'}int${bitsAllocated <= 8 ? '8' : '16'}`;
  } else {
    throw new Error(
      `Unsupported photometric interpretation: ${photometricInterpretation}`,
    );
  }

  return format as DicomImageFormat;
}

function normalizePixelData(frame: DicomFrame): Int16Array {
  if (frame.pixelData === undefined) {
    throw new Error('Frame does not contain pixel data');
  }

  const { bitsAllocated, photometricInterpretation, pixelRepresentation } =
    frame;
  const dicomImageFormat = getDicomImageFormat(
    bitsAllocated,
    photometricInterpretation,
    pixelRepresentation,
  );
  const rawPixelData = frame.pixelData;
  let typedPixelData: ArrayBufferView;

  // Casts pixel data to the right type
  switch (dicomImageFormat) {
    case 'int8':
      typedPixelData = new Int8Array(
        rawPixelData.buffer,
        rawPixelData.byteOffset,
        rawPixelData.byteLength / Int8Array.BYTES_PER_ELEMENT,
      );
      break;

    case 'int16':
      typedPixelData = new Int16Array(
        rawPixelData.buffer,
        rawPixelData.byteOffset,
        rawPixelData.byteLength / Int16Array.BYTES_PER_ELEMENT,
      );
      break;

    case 'uint8':
      typedPixelData = rawPixelData;
      break;

    case 'uint16':
      typedPixelData = new Uint16Array(
        rawPixelData.buffer,
        rawPixelData.byteOffset,
        rawPixelData.byteLength / Uint16Array.BYTES_PER_ELEMENT,
      );
      break;

    default:
      throw new Error('Unknown dicom format');
  }

  return typedPixelData instanceof Int16Array
    ? typedPixelData
    : new Int16Array(typedPixelData as any);
}
