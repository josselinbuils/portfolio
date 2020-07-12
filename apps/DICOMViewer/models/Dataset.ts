import { CoordinateSpace } from '../interfaces/CoordinateSpace';
import { DicomFrame } from './DicomFrame';
import { computeFrames } from '../utils/computeFrames';
import { computeSharedProperties } from '../utils/computeSharedProperties';
import { computeVolume } from '../utils/computeVolume';
import { V } from '../utils/math/Vector';
import { Frame } from './Frame';
import { Model } from './Model';
import { Volume } from './Volume';

const MANDATORY_FIELDS = ['frames', 'voxelSpacing'];

export class Dataset extends Model implements CoordinateSpace {
  frames!: Frame[];
  is3D: boolean;
  name!: string;
  volume?: Volume;

  // Shared properties (needed in both 2D/3D)
  voxelSpacing!: number[];

  static create(name: string, dicomFrames: DicomFrame[]): Dataset {
    const frames = computeFrames(dicomFrames);
    const sharedProperties = computeSharedProperties(frames);
    const volume = computeVolume(frames, sharedProperties);
    return new Dataset({ frames, name, ...sharedProperties, volume });
  }

  constructor(config: any) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
    this.is3D = this.volume !== undefined;
  }

  destroy(): void {
    this.frames.forEach((frame) => delete frame.pixelData);
  }

  findClosestFrame(point: number[]): Frame {
    const { imagePosition, imageNormal, spacingBetweenSlices } = this.frames[0];
    const index = Math.round(
      V(point).sub(imagePosition).dot(imageNormal) / spacingBetweenSlices
    );

    if (index < 0 || index >= this.frames.length) {
      const formattedPoint = JSON.stringify(
        point.map((c) => Math.round(c * 1000) / 1000)
      );
      throw new Error(
        `Unable to find a frame on which the point ${formattedPoint} is`
      );
    }

    return this.frames[index];
  }

  // eslint-disable-next-line class-methods-use-this
  getWorldBasis(): number[][] {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  getLimitsAlongAxe(
    axe: number[]
  ): {
    max: { point: number[]; positionOnAxe: number };
    min: { point: number[]; positionOnAxe: number };
  } {
    let maxPoint: number[] | undefined;
    let minPoint: number[] | undefined;
    let maxPositionOnAxe: number | undefined;
    let minPositionOnAxe: number | undefined;

    if (this.is3D) {
      if (this.volume === undefined) {
        throw new Error('Volume undefined');
      }

      maxPositionOnAxe = -Number.MAX_SAFE_INTEGER;
      minPositionOnAxe = Number.MAX_SAFE_INTEGER;

      for (const corner of Object.values(this.volume.corners)) {
        const positionAlongAxe = V(corner).dot(axe);

        if (positionAlongAxe > maxPositionOnAxe) {
          maxPoint = corner.slice();
          maxPositionOnAxe = positionAlongAxe;
        }
        if (positionAlongAxe < minPositionOnAxe) {
          minPoint = corner.slice();
          minPositionOnAxe = positionAlongAxe;
        }
      }
    } else {
      const firstFrame = this.frames[0];
      const lastFrame = this.frames[this.frames.length - 1];

      maxPoint = lastFrame.imagePosition;
      maxPositionOnAxe = V(maxPoint).dot(axe);

      minPoint = firstFrame.imagePosition;
      minPositionOnAxe = V(minPoint).dot(axe);
    }

    return {
      max: {
        point: maxPoint as number[],
        positionOnAxe: maxPositionOnAxe,
      },
      min: {
        point: minPoint as number[],
        positionOnAxe: minPositionOnAxe,
      },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getWorldOrigin(): number[] {
    return [0, 0, 0];
  }
}
