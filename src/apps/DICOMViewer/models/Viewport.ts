import { Subject } from '@josselinbuils/utils';
import { RendererType, ViewType } from '../constants';
import { Annotations, CoordinateSpace } from '../interfaces';
import { V } from '../utils/math';
import { Camera } from './Camera';
import { Dataset } from './Dataset';
import { Renderable } from './Renderable';
import { Volume } from './Volume';

const MANDATORY_FIELDS = ['camera', 'dataset', 'viewType'];

export class Viewport extends Renderable implements CoordinateSpace {
  annotations: Annotations = {};
  annotationsSubject = new Subject<Annotations>({});
  camera!: Camera;
  dataset!: Dataset;
  height = 0;
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
    rendererType: RendererType
  ): Viewport {
    const annotations = { datasetName: dataset.name, rendererType };
    const frame = dataset.frames[Math.floor(dataset.frames.length / 2)];
    const { windowCenter, windowWidth } = frame;

    const camera =
      viewType === ViewType.Native
        ? Camera.fromFrame(frame)
        : Camera.fromVolume(dataset.volume as Volume, viewType);

    return new Viewport({
      annotations,
      camera,
      dataset,
      viewType,
      windowCenter,
      windowWidth
    });
  }

  constructor(config: object) {
    super();
    super.fillProperties(config);
    super.checkMandatoryFieldsPresence(MANDATORY_FIELDS);
    super.decorateProperties();
    this.updateAnnotations();
    this.onUpdate.subscribe(() => {
      delete this.basis;
      delete this.origin;
      delete this.imageZoom;
    });
  }

  getWorldBasis(): number[][] {
    if (this.basis === undefined) {
      const cameraBasis = this.camera.getWorldBasis();
      const pixelHeightMm = this.camera.fieldOfView / this.height;

      this.basis = [
        V(cameraBasis[0]).div(pixelHeightMm),
        V(cameraBasis[1]).div(pixelHeightMm),
        cameraBasis[2]
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
                this.camera.upVector
              )
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
          `Viewport has incorrect dimensions: ${this.width}x${this.height}`
        );
      }

      const direction = this.camera.getDirection();
      const cameraBasis = this.camera.getWorldBasis();

      this.origin = V(this.camera.getWorldOrigin())
        .add(
          V(cameraBasis[0]).mul(
            ((-this.camera.fieldOfView / this.height) * this.width) / 2
          )
        )
        .add(V(cameraBasis[1]).mul(-this.camera.fieldOfView / 2))
        .add(direction);
    }
    return this.origin;
  }

  updateAnnotations(updatedProperties?: any): void {
    try {
      if (updatedProperties !== undefined) {
        Object.entries(updatedProperties).forEach(
          ([key, value]) => ((this.annotations as any)[key] = value)
        );
      } else {
        this.annotations.viewType = this.viewType;
        this.annotations.windowCenter = this.windowCenter;
        this.annotations.windowWidth = this.windowWidth;
        this.annotations.zoom = this.getImageZoom();
      }
      this.annotationsSubject.next({ ...this.annotations });
    } catch (error) {
      throw new Error(`Unable to compute annotations: ${error.stack}`);
    }
  }
}
