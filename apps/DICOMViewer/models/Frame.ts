import {
  NormalizedImageFormat,
  PhotometricInterpretation,
  PixelRepresentation,
} from '../constants';
import { DicomFrame } from './DicomFrame';
import { Model } from './Model';

const MANDATORY_FIELDS = [
  'dicom',
  'dimensionsMm',
  'id',
  'imageCenter',
  'imageFormat',
  'imageNormal',
  'bitsAllocated',
  'columns',
  'imageOrientation',
  'imagePosition',
  'patientName',
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
  imageFormat!: NormalizedImageFormat;
  imageNormal!: number[];

  /**
   * DICOM (filled with computed/default values if necessary)
   */
  bitsAllocated!: number;
  columns!: number;
  imageOrientation!: number[][];
  imagePosition!: number[];
  patientName!: string;
  photometricInterpretation!: PhotometricInterpretation;
  pixelData!: Int16Array | Uint8Array;
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

  constructor(config: object) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
  }
}
