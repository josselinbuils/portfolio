import { Model } from './Model';

export enum PixelRepresentation {
  Unsigned = 0,
  Signed = 1,
}

export type PhotometricInterpretation = 'MONOCHROME1' | 'MONOCHROME2';

const MANDATORY_FIELDS: readonly (keyof DicomFrame)[] = [
  'bitsAllocated',
  'columns',
  'photometricInterpretation',
  'pixelData',
  'pixelRepresentation',
  'rows',
  'sopInstanceUID',
];

export class DicomFrame extends Model {
  bitsAllocated!: number;
  columns!: number;
  imageOrientation?: number[][];
  imagePosition?: number[];
  patientName?: string;
  photometricInterpretation!: PhotometricInterpretation;
  pixelData?: Uint8Array;
  pixelRepresentation!: PixelRepresentation;
  pixelSpacing?: number[];
  rescaleIntercept?: number;
  rescaleSlope?: number;
  rows!: number;
  sliceLocation?: number;
  sopInstanceUID!: string;
  spacingBetweenSlices?: number;
  windowCenter?: number;
  windowWidth?: number;

  constructor(config: Record<string, any>) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
  }
}
