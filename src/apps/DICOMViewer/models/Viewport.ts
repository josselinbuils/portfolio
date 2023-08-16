import { type RendererType, ViewType } from '../constants';
import { type CoordinateSpace } from '../interfaces/CoordinateSpace';
import { type LUTComponent } from '../interfaces/LUTComponent';
import { V } from '../utils/math/Vector';
import { Camera } from './Camera';
import { type Dataset } from './Dataset';
import { Renderable } from './Renderable';
import { type Volume } from './Volume';

const MANDATORY_FIELDS: readonly (keyof Viewport)[] = [
  'camera',
  'dataset',
  'viewType',
];
const SENSITIVE_FIELDS: readonly (keyof Viewport)[] = [
  'camera',
  'dataset',
  'height',
  'viewType',
  'width',
];

export class Viewport extends Renderable implements CoordinateSpace {
  camera!: Camera;
  dataset!: Dataset;
  height = 0;
  lutComponents?: LUTComponent[] = undefined; // Value needed to be decorated by Renderable
  rendererType!: RendererType;
  viewType!: ViewType;
  width = 0;
  windowCenter = 30;
  windowWidth = 400;

  private basis?: number[][];
  private imageZoom?: number;
  private origin?: number[];

  static create(
    dataset: Dataset,
    viewType: ViewType,
    rendererType: RendererType,
    lutComponents?: LUTComponent[],
  ): Viewport {
    const frame = dataset.frames[Math.floor(dataset.frames.length / 2)];
    const { windowCenter, windowWidth } = frame;

    const camera =
      viewType === ViewType.Native
        ? Camera.fromFrame(frame)
        : Camera.fromVolume(dataset.volume as Volume, viewType);

    return new Viewport({
      camera,
      dataset,
      lutComponents,
      rendererType,
      viewType,
      windowCenter,
      windowWidth,
    });
  }

  constructor(config: Partial<Viewport>) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
    super.decorateProperties();
    this.onUpdate.subscribe((keyChanged) => {
      if (SENSITIVE_FIELDS.includes(keyChanged as keyof Viewport)) {
        delete this.basis;
        delete this.imageZoom;
        delete this.origin;
      }
    });
  }

  clone(properties: { [key: string]: any }): Viewport {
    const {
      camera,
      dataset,
      height,
      lutComponents,
      rendererType,
      viewType,
      width,
      windowCenter,
      windowWidth,
    } = this;

    return new Viewport({
      camera,
      dataset,
      height,
      lutComponents,
      rendererType,
      viewType,
      width,
      windowCenter,
      windowWidth,
      ...properties,
    });
  }

  getWorldBasis(): number[][] {
    if (this.basis === undefined) {
      const cameraBasis = this.camera.getWorldBasis();
      const pixelHeightMm = this.camera.fieldOfView / this.height;

      this.basis = [
        V(cameraBasis[0]).div(pixelHeightMm),
        V(cameraBasis[1]).div(pixelHeightMm),
        cameraBasis[2],
      ];
    }
    return this.basis;
  }

  getImageZoom(): number {
    if (this.imageZoom === undefined) {
      const sliceHeight =
        this.viewType === ViewType.Native
          ? this.dataset.findClosestFrame(this.camera.lookPoint).rows
          : Math.abs(
              V((this.dataset.volume as Volume).dimensionsVoxels).dot(
                this.camera.upVector,
              ),
            );

      this.imageZoom =
        ((this.height / sliceHeight) * this.camera.baseFieldOfView) /
        this.camera.fieldOfView;
    }
    return this.imageZoom;
  }

  getWorldOrigin(): number[] {
    if (this.origin === undefined) {
      if (this.width === 0 || this.height === 0) {
        throw new Error(
          `Viewport has incorrect dimensions: ${this.width}x${this.height}`,
        );
      }

      const direction = this.camera.getDirection();
      const cameraBasis = this.camera.getWorldBasis();

      this.origin = V(this.camera.getWorldOrigin())
        .add(
          V(cameraBasis[0]).mul(
            ((-this.camera.fieldOfView / this.height) * this.width) / 2,
          ),
        )
        .add(V(cameraBasis[1]).mul(-this.camera.fieldOfView / 2))
        .add(direction);
    }
    return this.origin;
  }
}
