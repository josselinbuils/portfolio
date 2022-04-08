import dicomParser from 'dicom-parser';
import { extendError } from '~/platform/utils/extendError';
import { PhotometricInterpretation } from '../constants';
import { File } from '../interfaces/File';
import { DicomFrame } from '../models/DicomFrame';

export async function decodeFrames(files: File[]): Promise<DicomFrame[]> {
  let frames: DicomFrame[];

  if (files.length === 1) {
    frames = await loadInstance(files[0]);
  } else if (files.length > 0) {
    frames = [];

    const instanceFramesList = await Promise.all(
      files.map((file) => loadInstance(file))
    );
    for (const instanceFrames of instanceFramesList) {
      frames.push(...instanceFrames);
    }

    frames = frames.every((frame) => frame.sliceLocation !== undefined)
      ? frames.sort((a, b) =>
          (a as any).sliceLocation > (b as any).sliceLocation ? 1 : -1
        )
      : frames.sort((a, b) => (a.sopInstanceUID > b.sopInstanceUID ? 1 : -1));
  } else {
    throw new Error('No file to load');
  }

  return frames;
}

function findWindowingInFunctionalGroup(
  functionalGroup: any,
  index = 0
): Windowing | undefined {
  if (functionalGroup !== undefined) {
    const voiLUT = functionalGroup.items[index].dataSet.elements.x00289132;

    if (voiLUT !== undefined) {
      const dataset = voiLUT.items[0].dataSet;
      const { elements } = dataset;

      if (
        elements.x00281050 !== undefined &&
        elements.x00281051 !== undefined
      ) {
        return {
          windowCenter: dataset.intString('x00281050'),
          windowWidth: dataset.intString('x00281051'),
        };
      }
    }
  }
  return undefined;
}

function floatStringsToArray(
  parsedFile: ParsedDicomFile,
  tag: string,
  slice?: number
): number[] | number[][] | undefined {
  const nbValues = parsedFile.numStringValues(tag);

  if (nbValues > 0) {
    const array: number[] = [];

    for (let i = 0; i < nbValues; i++) {
      array.push(parsedFile.floatString(tag, i) as number);
    }

    if (slice !== undefined) {
      const slicedArray: number[][] = [];

      for (let j = 0; j < array.length; j += slice) {
        slicedArray.push(array.slice(j, j + slice));
      }
      return slicedArray;
    }

    return array;
  }

  return undefined;
}

async function loadInstance(file: File): Promise<DicomFrame[]> {
  try {
    const dicomData = new Uint8Array(file.content);
    const parsedFile: ParsedDicomFile = dicomParser.parseDicom(dicomData);

    /**
     * DICOM fields
     */
    const instance: any = {
      bitsAllocated: parsedFile.uint16('x00280100'),
      columns: parsedFile.uint16('x00280011'),
      imagePosition: floatStringsToArray(parsedFile, 'x00200032'),
      imageOrientation: floatStringsToArray(parsedFile, 'x00200037', 3),
      patientName: parsedFile.string('x00100010'),
      photometricInterpretation: parsedFile.string(
        'x00280004'
      ) as PhotometricInterpretation,
      pixelRepresentation: parsedFile.uint16('x00280103'),
      pixelSpacing: floatStringsToArray(parsedFile, 'x00280030'),
      rescaleIntercept: parsedFile.intString('x00281052'),
      rescaleSlope: parsedFile.floatString('x00281053'),
      rows: parsedFile.uint16('x00280010'),
      sliceLocation: parsedFile.floatString('x00201041'),
      sopInstanceUID: parsedFile.string('x00080018'),
      spacingBetweenSlices: parsedFile.floatString('x00180088'),
      windowCenter: parsedFile.intString('x00281050'),
      windowWidth: parsedFile.intString('x00281051'),
    };

    const numberOfFrames = parsedFile.intString('x00280008');
    const pixelDataElement = parsedFile.elements.x7fe00010;
    const pixelData: Uint8Array = dicomParser.sharedCopy(
      dicomData,
      pixelDataElement.dataOffset,
      pixelDataElement.length
    );

    const frames: DicomFrame[] = [];

    if (Number.isInteger(numberOfFrames)) {
      const frameLength = pixelData.length / numberOfFrames;

      if (!Number.isInteger(frameLength)) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`frameLength shall be an integer: ${frameLength}`);
      }

      const sharedWindowing = findWindowingInFunctionalGroup(
        parsedFile.elements.x52009229
      );

      if (sharedWindowing !== undefined) {
        instance.windowCenter = sharedWindowing.windowCenter;
        instance.windowWidth = sharedWindowing.windowWidth;
      }

      for (let i = 0; i < numberOfFrames; i++) {
        const frame = JSON.parse(JSON.stringify(instance));
        const byteOffset =
          pixelData.byteOffset + frameLength * pixelData.BYTES_PER_ELEMENT * i;

        frame.pixelData = new Uint8Array(
          pixelData.buffer,
          byteOffset,
          frameLength
        );

        if (sharedWindowing === undefined) {
          const frameWindowing = findWindowingInFunctionalGroup(
            parsedFile.elements.x52009230,
            i
          );

          if (frameWindowing !== undefined) {
            frame.windowCenter = frameWindowing.windowCenter;
            frame.windowWidth = frameWindowing.windowWidth;
          }
        }

        frames.push(new DicomFrame(frame));
      }
    } else {
      instance.pixelData = pixelData;
      frames.push(new DicomFrame(instance));
    }

    return frames;
  } catch (error: unknown) {
    throw extendError(
      `Unable to load DICOM instance from "${file.name}"`,
      error
    );
  }
}

interface ParsedDicomFile {
  fileName: string;

  elements: { [tag: string]: { dataOffset: number; length: number } };

  attributeTag(tag: string): string;

  floatString(tag: string, index?: number): number;

  intString(tag: string, index?: number): number;

  numStringValues(tag: string): number;

  string(tag: string): string;

  uint16(tag: string): number;
}

interface Windowing {
  windowCenter: number;
  windowWidth: number;
}
