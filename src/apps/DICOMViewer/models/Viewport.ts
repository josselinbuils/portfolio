import { VIEW_TYPES_3D } from '../constants';
import { type CoordinateSpace } from '../interfaces/CoordinateSpace';
import { type LUTComponent } from '../interfaces/LUTComponent';
import { type RendererType } from '../interfaces/RendererType';
import { type ViewType } from '../interfaces/ViewType';
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
  draft = false;
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
  ): Viewport {
    const frame = dataset.frames[Math.floor(dataset.frames.length / 2)];
    const { windowCenter, windowWidth } = frame;

    const camera =
      viewType === 'Native'
        ? Camera.fromFrame(frame)
        : Camera.fromVolume(dataset.volume as Volume, viewType);

    const lutComponents =
      viewType === '3D Skin'
        ? [
            { id: '0', start: -25, end: 125, color: [255, 190, 180] },
            { id: '1', start: 100, end: 250, color: [255, 140, 130] },
            { id: '2', start: 215, end: 300, color: [255, 255, 255] },
          ]
        : undefined;

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
        V(cameraBasis[0]).scale(1 / pixelHeightMm),
        V(cameraBasis[1]).scale(1 / pixelHeightMm),
        cameraBasis[2],
      ];
    }
    return this.basis;
  }

  getImageZoom(): number {
    if (this.imageZoom === undefined) {
      const sliceHeight =
        this.viewType === '3D Skin'
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
          V(cameraBasis[0]).scale(
            ((-this.camera.fieldOfView / this.height) * this.width) / 2,
          ),
        )
        .add(V(cameraBasis[1]).scale(-this.camera.fieldOfView / 2))
        .add(direction);
    }
    return this.origin;
  }

  is3D() {
    return VIEW_TYPES_3D.includes(this.viewType);
  }
}
