import {
  type DicomFrame,
  type PhotometricInterpretation,
  type PixelRepresentation,
} from './DicomFrame';
import { Model } from './Model';

const MANDATORY_FIELDS: readonly (keyof Frame)[] = [
  'dicom',
  'dimensionsMm',
  'id',
  'imageCenter',
  'imageNormal',
  'bitsAllocated',
  'columns',
  'imageOrientation',
  'imagePosition',
  'photometricInterpretation',
  'pixelData',
  'pixelRepresentation',
  'pixelSpacing',
  'rows',
  'sliceLocation',
  'sopInstanceUID',
  'spacingBetweenSlices',
];

export class Frame extends Model {
  /**
   * Computed
   */
  dicom!: DicomFrame;
  dimensionsMm!: number[];
  id!: string;
  imageCenter!: number[];
  imageNormal!: number[];

  /**
   * DICOM (filled with computed/default values if necessary)
   */
  bitsAllocated!: number;
  columns!: number;
  imageOrientation!: number[][];
  imagePosition!: number[];
  patientName?: string;
  photometricInterpretation!: PhotometricInterpretation;
  pixelData?: Int16Array | Uint8Array;
  pixelRepresentation!: PixelRepresentation;
  pixelSpacing!: number[];
  rescaleIntercept = 0;
  rescaleSlope = 1;
  rows!: number;
  sliceLocation!: number;
  sopInstanceUID!: string;
  spacingBetweenSlices!: number;
  windowCenter = 30;
  windowWidth = 400;

  constructor(config: { [key: string]: any }) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
  }
}
