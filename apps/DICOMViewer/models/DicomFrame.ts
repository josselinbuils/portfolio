import { PhotometricInterpretation, PixelRepresentation } from '../constants';
import { Model } from './Model';

const MANDATORY_FIELDS = [
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

  constructor(config: { [key: string]: any }) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
  }
}
