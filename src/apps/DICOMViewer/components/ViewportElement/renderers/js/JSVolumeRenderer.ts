import { type VOILUT } from '@/apps/DICOMViewer/interfaces/VOILUT';
import { type Dataset } from '@/apps/DICOMViewer/models/Dataset';
import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { type Volume } from '@/apps/DICOMViewer/models/Volume';
import { changePointSpace } from '@/apps/DICOMViewer/utils/changePointSpace';
import { loadVOILUT } from '@/apps/DICOMViewer/utils/loadVOILUT';
import { V } from '@/apps/DICOMViewer/utils/math/Vector';
import { type Renderer } from '../Renderer';
import { getDefaultVOILUT } from '../utils/getDefaultVOILUT';
import {
  getRenderingProperties,
  type RenderingProperties,
  type ViewportSpaceCoordinates,
} from '../utils/getRenderingProperties';
import { displayCube } from './utils/displayCube';
import { drawImageData } from './utils/drawImageData';
import { getCanvasRenderingContexts } from './utils/getCanvasRenderingContexts';

export class JSVolumeRenderer implements Renderer {
  private readonly context: CanvasRenderingContext2D;
  private lut?: VOILUT;
  private readonly renderingContext: CanvasRenderingContext2D;
  private unsubscribeToViewportUpdates?: () => void;

  static getRawValue(dataset: Dataset, pointLPS: number[]): number {
    const { firstVoxelCenter, orientation, voxelSpacing } =
      dataset.volume as Volume;

    const vector = [
      (pointLPS[0] - firstVoxelCenter[0]) / voxelSpacing[0],
      (pointLPS[1] - firstVoxelCenter[1]) / voxelSpacing[1],
      (pointLPS[2] - firstVoxelCenter[2]) / voxelSpacing[2],
    ];

    const index = Math.round(
      vector[0] * orientation[2][0] +
        vector[1] * orientation[2][1] +
        vector[2] * orientation[2][2],
    );
    const frame = dataset.frames[index];

    if (frame === undefined || frame.pixelData === undefined) {
      return -Number.MAX_SAFE_INTEGER;
    }

    const {
      columns,
      imagePosition,
      imageOrientation,
      pixelData,
      rescaleIntercept,
      rescaleSlope,
      rows,
    } = frame;

    const imagePositionToPoint = [
      (pointLPS[0] - imagePosition[0]) / voxelSpacing[0],
      (pointLPS[1] - imagePosition[1]) / voxelSpacing[1],
      (pointLPS[2] - imagePosition[2]) / voxelSpacing[2],
    ];

    const i =
      (imagePositionToPoint[0] * imageOrientation[0][0] +
        imagePositionToPoint[1] * imageOrientation[0][1] +
        imagePositionToPoint[2] * imageOrientation[0][2]) |
      0;

    const j =
      (imagePositionToPoint[0] * imageOrientation[1][0] +
        imagePositionToPoint[1] * imageOrientation[1][1] +
        imagePositionToPoint[2] * imageOrientation[1][2]) |
      0;

    return i >= 0 && i < columns && j >= 0 && j < rows
      ? pixelData[j * columns + i] * rescaleSlope + rescaleIntercept
      : -Number.MAX_SAFE_INTEGER;
  }

  private static getImageWorldBasis(viewport: Viewport): number[][] {
    const { camera, dataset } = viewport;
    const cameraBasis = camera.getWorldBasis();
    const horizontalVoxelSpacing = Math.abs(
      V(dataset.voxelSpacing).dot(cameraBasis[0]),
    );
    const verticalVoxelSpacing = Math.abs(
      V(dataset.voxelSpacing).dot(cameraBasis[1]),
    );

    return [
      V(cameraBasis[0]).scale(horizontalVoxelSpacing),
      V(cameraBasis[1]).scale(verticalVoxelSpacing),
    ];
  }

  private static getImageWorldOrigin(
    viewport: Viewport,
    viewportSpace: ViewportSpaceCoordinates,
  ): number[] {
    const { dataset } = viewport;
    return changePointSpace(
      [viewportSpace.imageX0, viewportSpace.imageY0, 0],
      viewport,
      dataset,
    );
  }

  private static getPointLPS(
    imageWorldOrigin: number[],
    xAxis: number[],
    yAxis: number[],
    x: number,
    y: number,
  ): number[] {
    return [
      imageWorldOrigin[0] + xAxis[0] * x + yAxis[0] * y,
      imageWorldOrigin[1] + xAxis[1] * x + yAxis[1] * y,
      imageWorldOrigin[2] + xAxis[2] * x + yAxis[2] * y,
    ];
  }

  constructor(private readonly canvas: HTMLCanvasElement) {
    const { context, renderingContext } = getCanvasRenderingContexts(canvas);
    this.context = context;
    this.renderingContext = renderingContext;
  }

  destroy() {
    this.unsubscribeToViewportUpdates?.();
    delete (this as any).context;
    delete (this as any).renderingContext;
  }

  init(viewport: Viewport) {
    this.unsubscribeToViewportUpdates = viewport.onUpdate.subscribe((key) => {
      if (['lutComponents', 'viewType'].includes(key)) {
        delete this.lut;
      }
    });
  }

  async render(viewport: Viewport): Promise<void> {
    const { dataset, windowWidth } = viewport;

    if (dataset.volume === undefined) {
      throw new Error('Volume undefined');
    }

    const renderingProperties = getRenderingProperties(viewport);

    if (renderingProperties === undefined) {
      return;
    }

    if (this.lut === undefined || this.lut.windowWidth !== windowWidth) {
      this.lut =
        viewport.lutComponents !== undefined
          ? loadVOILUT(viewport.lutComponents, windowWidth)
          : getDefaultVOILUT(
              windowWidth,
              viewport.viewType === 'oblique' ? 10 : 0,
            );
    }

    const { boundedViewportSpace, imageSpace } = renderingProperties;
    const imagePixelsToRender =
      imageSpace.displayWidth * imageSpace.displayHeight;
    const viewportPixelsToRender =
      boundedViewportSpace.imageWidth * boundedViewportSpace.imageHeight;
    let renderPixels: () => void | Promise<void>;

    if (viewport.is3D()) {
      renderPixels = async () =>
        this.render3DImagePixels(viewport, renderingProperties);
    } else {
      renderPixels =
        viewportPixelsToRender < imagePixelsToRender
          ? () => this.renderMPRViewportPixels(viewport, renderingProperties)
          : () => this.renderMPRImagePixels(viewport, renderingProperties);
    }

    if (viewport.viewType === 'oblique') {
      displayCube(viewport, this.canvas, renderPixels as () => void);
    } else {
      this.context.fillStyle = 'black';
      this.context.fillRect(0, 0, viewport.width, viewport.height);
      await renderPixels();
    }
  }

  private getPixelValue(
    leftLimit: number,
    rightLimit: number,
    rawValue: number,
    baseAlpha = 255,
  ): number {
    const color =
      this.lut!.table[
        Math.max(Math.min(rawValue - leftLimit, rightLimit - leftLimit - 1), 0)
      ];

    const alpha = rawValue < -(Number.MAX_SAFE_INTEGER - 1) ? 0 : baseAlpha;
    return color[0] | (color[1] << 8) | (color[2] << 16) | (alpha << 24);
  }

  private async render3DImagePixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties,
  ): Promise<void> {
    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace,
    } = renderingProperties;

    const displayX0 = Math.ceil(imageSpace.displayX0);
    const displayY0 = Math.ceil(imageSpace.displayY0);

    // Allow to compute pointLPS with higher precision to prevent zoom glitches
    const xDelta = imageSpace.displayX0 - displayX0;
    const yDelta = imageSpace.displayY0 - displayY0;

    let displayWidth = Math.floor(imageSpace.displayWidth);
    let displayHeight = Math.floor(imageSpace.displayHeight);

    // We need both displayWidth and displayHeight to be divisible by 2 so their
    // product is divisible by 4.
    if (displayWidth % 2 > 0) {
      displayWidth += 1;
    }
    if (displayHeight % 2 > 0) {
      displayHeight += 1;
    }

    const displayX1 = displayX0 + displayWidth - 1;
    const displayY1 = displayY0 + displayHeight - 1;

    const imageWorldOrigin = JSVolumeRenderer.getImageWorldOrigin(
      viewport,
      viewportSpace,
    );
    const [xAxis, yAxis] = JSVolumeRenderer.getImageWorldBasis(viewport);
    const draftImageData32 = new Uint32Array(
      (displayWidth * displayHeight) / 4,
    );
    const imageData32 = new Uint32Array(displayWidth * displayHeight);
    const getPixelValue = this.getPixelValue.bind(this, leftLimit, rightLimit);

    const { camera, dataset } = viewport;
    const { dimensionsVoxels, voxelSpacing } = dataset.volume!;
    const direction = camera.getDirection();
    const directionScaled = V(direction).scale(
      V(voxelSpacing).mul(direction).norm(),
    );
    const targetRatio = viewport.viewType === 'bones' ? 1.1 : 100;
    const targetValue = leftLimit + (rightLimit - leftLimit) / targetRatio;

    const offsets = [
      [0, 0],
      [1, 1],
      [1, 0],
      [0, 1],
    ];

    let draftDataIndex = 0;

    for (const [offsetX, offsetY] of offsets) {
      let dataIndex = offsetY * displayWidth + offsetX;

      for (let y = displayY0 + offsetY; y <= displayY1; y += 2) {
        for (let x = displayX0 + offsetX; x <= displayX1; x += 2) {
          const pointLPS = JSVolumeRenderer.getPointLPS(
            imageWorldOrigin,
            xAxis,
            yAxis,
            x + xDelta,
            y + yDelta,
          );
          let pixelValue;

          for (let i = 0; i < dimensionsVoxels[1]; i++) {
            const rawPixelValue = JSVolumeRenderer.getRawValue(
              dataset,
              pointLPS,
            );

            if (rawPixelValue > targetValue) {
              pixelValue = getPixelValue(
                rawPixelValue,
                Math.round(
                  255 / Math.max((i * i) / dimensionsVoxels[2] / 100, 1),
                ),
              );

              break;
            }
            pointLPS[0] += directionScaled[0];
            pointLPS[1] += directionScaled[1];
            pointLPS[2] += directionScaled[2];
          }

          if (offsetX === 0 && offsetY === 0) {
            draftImageData32[draftDataIndex++] = pixelValue || 0 | 0;
          }

          imageData32[dataIndex] = pixelValue || 0 | 0;
          dataIndex += 2;
        }
        dataIndex += displayWidth;
      }

      if (offsetX === 0 && offsetY === 0) {
        drawImageData(
          draftImageData32,
          this.context,
          this.renderingContext,
          displayWidth / 2,
          displayHeight / 2,
          boundedViewportSpace,
        );

        if (viewport.draft) {
          return;
        }

        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        }); // Empty the event queue to force drawing
      }
    }
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height,
    );
    drawImageData(
      imageData32,
      this.context,
      this.renderingContext,
      displayWidth,
      displayHeight,
      boundedViewportSpace,
    );
  }

  private renderMPRImagePixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties,
  ): void {
    const { dataset } = viewport;
    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace,
    } = renderingProperties;

    const displayX0 = Math.ceil(imageSpace.displayX0);
    const displayY0 = Math.ceil(imageSpace.displayY0);

    // Allow to compute pointLPS with higher precision to prevent zoom glitches
    const xDelta = imageSpace.displayX0 - displayX0;
    const yDelta = imageSpace.displayY0 - displayY0;

    const displayWidth = Math.floor(imageSpace.displayWidth);
    const displayHeight = Math.floor(imageSpace.displayHeight);

    const displayX1 = displayX0 + displayWidth - 1;
    const displayY1 = displayY0 + displayHeight - 1;

    const imageWorldOrigin = JSVolumeRenderer.getImageWorldOrigin(
      viewport,
      viewportSpace,
    );
    const [xAxis, yAxis] = JSVolumeRenderer.getImageWorldBasis(viewport);
    const imageData32 = new Uint32Array(displayWidth * displayHeight);
    const getPixelValue = this.getPixelValue.bind(this, leftLimit, rightLimit);
    let dataIndex = 0;

    for (let y = displayY0; y <= displayY1; y++) {
      for (let x = displayX0; x <= displayX1; x++) {
        const pointLPS = JSVolumeRenderer.getPointLPS(
          imageWorldOrigin,
          xAxis,
          yAxis,
          x + xDelta,
          y + yDelta,
        );
        const rawValue = JSVolumeRenderer.getRawValue(dataset, pointLPS);
        imageData32[dataIndex++] = getPixelValue(rawValue);
      }
    }

    drawImageData(
      imageData32,
      this.context,
      this.renderingContext,
      displayWidth,
      displayHeight,
      boundedViewportSpace,
    );
  }

  private renderMPRViewportPixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties,
  ): void {
    const { dataset } = viewport;
    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace,
    } = renderingProperties;

    const imageX0 = Math.ceil(boundedViewportSpace.imageX0);
    const imageY0 = Math.ceil(boundedViewportSpace.imageY0);

    // Allow to compute pointLPS with higher precision to prevent zoom glitches
    const xDelta = boundedViewportSpace.imageX0 - imageX0;
    const yDelta = boundedViewportSpace.imageY0 - imageY0;

    const imageWidth = Math.floor(boundedViewportSpace.imageWidth);
    const imageHeight = Math.floor(boundedViewportSpace.imageHeight);

    const imageX1 = imageX0 + imageWidth - 1;
    const imageY1 = imageY0 + imageHeight - 1;

    const { displayWidth, displayHeight } = imageSpace;

    const viewportSpaceImageX0 = viewportSpace.imageX0;
    const viewportSpaceImageY0 = viewportSpace.imageY0;
    const imageWorldOrigin = JSVolumeRenderer.getImageWorldOrigin(
      viewport,
      viewportSpace,
    );
    let [xAxis, yAxis] = JSVolumeRenderer.getImageWorldBasis(viewport);

    xAxis = V(xAxis).scale(displayWidth / imageWidth);
    yAxis = V(yAxis).scale(displayHeight / imageHeight);

    const imageData32 = new Uint32Array(imageWidth * imageHeight);
    const getPixelValue = this.getPixelValue.bind(this, leftLimit, rightLimit);
    let dataIndex = 0;

    for (let y = imageY0; y <= imageY1; y++) {
      for (let x = imageX0; x <= imageX1; x++) {
        const pointLPS = JSVolumeRenderer.getPointLPS(
          imageWorldOrigin,
          xAxis,
          yAxis,
          x + xDelta - viewportSpaceImageX0,
          y + yDelta - viewportSpaceImageY0,
        );
        const rawValue = JSVolumeRenderer.getRawValue(dataset, pointLPS);
        imageData32[dataIndex++] = getPixelValue(rawValue);
      }
    }

    drawImageData(
      imageData32,
      this.context,
      this.renderingContext,
      imageWidth,
      imageHeight,
      boundedViewportSpace,
    );
  }
}
