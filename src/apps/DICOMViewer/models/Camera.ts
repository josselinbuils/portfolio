import { VIEW_TYPES_3D } from '../constants';
import { type CoordinateSpace } from '../interfaces/CoordinateSpace';
import { type ViewType } from '../interfaces/ViewType';
import { V } from '../utils/math/Vector';
import { type Frame } from './Frame';
import { Renderable } from './Renderable';
import { type Volume } from './Volume';

const MANDATORY_FIELDS: readonly (keyof Camera)[] = [
  'baseFieldOfView',
  'eyePoint',
  'fieldOfView',
  'lookPoint',
  'upVector',
];

const DEFAULT_VIEWPORT_FIELD_OF_VIEW_FACTOR = 1.2;

export class Camera extends Renderable implements CoordinateSpace {
  baseFieldOfView!: number; // Volume size along the vertical axis of the camera
  eyePoint!: number[];
  fieldOfView!: number;
  lookPoint!: number[];
  upVector!: number[];

  private basis?: number[][];
  private direction?: number[];

  static fromFrame(frame: Frame): Camera {
    const { dimensionsMm, imageCenter, imageNormal, imageOrientation } = frame;

    const baseFieldOfView = dimensionsMm[1];
    const fieldOfView = baseFieldOfView * DEFAULT_VIEWPORT_FIELD_OF_VIEW_FACTOR;
    const lookPoint = imageCenter.slice();
    const eyePoint = V(lookPoint).sub(imageNormal);
    // Frame vertical axis is inverted compared to axial view
    const upVector = V(imageOrientation[1]).neg();

    return new Camera({
      baseFieldOfView,
      eyePoint,
      fieldOfView,
      lookPoint,
      upVector,
    });
  }

  static fromVolume(volume: Volume, viewType: ViewType): Camera {
    let direction: number[];
    let upVector: number[];

    switch (viewType) {
      case 'axial':
        direction = [0, 0, 1];
        upVector = [0, -1, 0];
        break;

      case 'bones':
      case 'coronal':
      case 'mip':
      case 'skin':
        direction = [0, 1, 0];
        upVector = [0, 0, 1];
        break;

      case 'sagittal':
        direction = [-1, 0, 0];
        upVector = [0, 0, 1];
        break;

      default:
        throw new Error(`Unknown view type: ${viewType}`);
    }

    const baseFieldOfView = volume.getOrientedDimensionMm(upVector);
    const fieldOfView = baseFieldOfView * DEFAULT_VIEWPORT_FIELD_OF_VIEW_FACTOR;
    let lookPoint = volume.center;

    if (VIEW_TYPES_3D.includes(viewType)) {
      const correctionVector = V(direction).scale(
        -volume.getOrientedDimensionMm(direction) / 2,
      );
      lookPoint = V(lookPoint).add(correctionVector).smooth();
    }

    const eyePoint = V(lookPoint).sub(direction);

    return new Camera({
      baseFieldOfView,
      eyePoint,
      fieldOfView,
      lookPoint,
      upVector,
    });
  }

  constructor(config: any) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
    super.decorateProperties();
    this.onUpdate.subscribe(() => {
      delete this.basis;
      delete this.direction;
    });
  }

  getDirection(): number[] {
    if (this.direction === undefined) {
      this.direction = V(this.lookPoint).sub(this.eyePoint).normalize();
    }
    return this.direction;
  }

  /*
   * LPS
   *    ------> x
   *   /|
   *  / |
   * z  y
   */
  getWorldBasis(): number[][] {
    if (this.basis === undefined) {
      const y = V(this.upVector).neg().normalize();
      const z = this.getDirection();
      const x = V(y).cross(z).normalize();
      this.basis = [x, y, z];
    }
    return this.basis;
  }

  getWorldOrigin(): number[] {
    return this.eyePoint;
  }
}
