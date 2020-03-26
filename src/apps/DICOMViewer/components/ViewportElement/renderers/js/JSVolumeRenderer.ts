import { VOILUT } from '~/apps/DICOMViewer/interfaces';
import { Dataset, Viewport, Volume } from '~/apps/DICOMViewer/models';
import { changePointSpace, loadVOILUT } from '~/apps/DICOMViewer/utils';
import { V } from '~/apps/DICOMViewer/utils/math';
import { Renderer } from '../Renderer';
import {
  ImageSpaceCoordinates,
  RenderingProperties,
  ViewportSpaceCoordinates,
} from '../RenderingProperties';
import { getRenderingProperties } from '../renderingUtils';
import {
  drawImageData,
  getCanvasRenderingContexts,
  getDefaultVOILUT,
} from './utils';

export class JSVolumeRenderer implements Renderer {
  private readonly context: CanvasRenderingContext2D;
  private lut?: { table: number[] | number[][]; windowWidth: number };
  private readonly renderingContext: CanvasRenderingContext2D;

  private static getImageWorldBasis(viewport: Viewport): number[][] {
    const { camera, dataset } = viewport;
    const cameraBasis = camera.getWorldBasis();
    const horizontalVoxelSpacing = Math.abs(
      V(dataset.voxelSpacing).dot(cameraBasis[0])
    );
    const verticalVoxelSpacing = Math.abs(
      V(dataset.voxelSpacing).dot(cameraBasis[1])
    );

    return [
      V(cameraBasis[0]).mul(horizontalVoxelSpacing),
      V(cameraBasis[1]).mul(verticalVoxelSpacing),
    ];
  }

  private static getImageWorldOrigin(
    viewport: Viewport,
    viewportSpace: ViewportSpaceCoordinates
  ): number[] {
    const { dataset } = viewport;
    return changePointSpace(
      [viewportSpace.imageX0, viewportSpace.imageY0, 0],
      viewport,
      dataset
    );
  }

  private static getRawValue(dataset: Dataset, pointLPS: number[]): number {
    const {
      firstVoxelCenter,
      orientation,
      voxelSpacing,
    } = dataset.volume as Volume;

    const vector = [
      (pointLPS[0] - firstVoxelCenter[0]) / voxelSpacing[0],
      (pointLPS[1] - firstVoxelCenter[1]) / voxelSpacing[1],
      (pointLPS[2] - firstVoxelCenter[2]) / voxelSpacing[2],
    ];

    const index = Math.round(
      vector[0] * orientation[2][0] +
        vector[1] * orientation[2][1] +
        vector[2] * orientation[2][2]
    );
    const frame = dataset.frames[index];

    if (frame === undefined) {
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

  private static getPointLPS(
    imageWorldOrigin: number[],
    xAxis: number[],
    yAxis: number[],
    x: number,
    y: number
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

  render(viewport: Viewport): void {
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
          : getDefaultVOILUT(windowWidth);
    }

    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, viewport.width, viewport.height);
    this.renderImagePixels(viewport, renderingProperties);
  }

  private createPixelValueGetter(
    leftLimit: number,
    rightLimit: number
  ): (rawValue: number, baseAlpha?: number) => number {
    return Array.isArray((this.lut as VOILUT).table[0])
      ? this.getColorPixelValue.bind(this, leftLimit, rightLimit)
      : this.getMonochromePixelValue.bind(this, leftLimit, rightLimit);
  }

  private getColorPixelValue(
    leftLimit: number,
    rightLimit: number,
    rawValue: number,
    baseAlpha: number = 255
  ): number {
    const color = (this.lut as VOILUT).table[
      Math.max(Math.min(rawValue - leftLimit, rightLimit - leftLimit - 1), 0)
    ] as number[];

    const alpha = rawValue < -(Number.MAX_SAFE_INTEGER - 1) ? 0 : baseAlpha;
    return color[0] | (color[1] << 8) | (color[2] << 16) | (alpha << 24);
  }

  private getMonochromePixelValue(
    leftLimit: number,
    rightLimit: number,
    rawValue: number,
    baseAlpha: number = 255
  ): number {
    let intensity = 250;

    if (rawValue < leftLimit) {
      intensity = 0;
    } else if (rawValue < rightLimit) {
      intensity = (this.lut as VOILUT).table[rawValue - leftLimit] as number;
    }

    const alpha = rawValue < -(Number.MAX_SAFE_INTEGER - 1) ? 0 : baseAlpha;
    return intensity | (intensity << 8) | (intensity << 16) | (alpha << 24);
  }

  private renderImagePixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties
  ): void {
    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace,
    } = renderingProperties;
    const {
      displayHeight,
      displayWidth,
      displayX0,
      displayX1,
      displayY0,
      displayY1,
    } = imageSpace as ImageSpaceCoordinates;

    const imageWorldOrigin = JSVolumeRenderer.getImageWorldOrigin(
      viewport,
      viewportSpace
    );
    const [xAxis, yAxis] = JSVolumeRenderer.getImageWorldBasis(viewport);
    const imageData32 = new Uint32Array(displayWidth * displayHeight);
    const getPixelValue = this.createPixelValueGetter(leftLimit, rightLimit);
    let dataIndex = 0;

    const { camera, dataset } = viewport;
    const basis = camera.getWorldBasis();
    const direction = basis[2];
    const { dimensionsVoxels } = dataset.volume as Volume;
    const targetValue = leftLimit + (rightLimit - leftLimit) / 1.1;
    let pointLPS = JSVolumeRenderer.getPointLPS(
      imageWorldOrigin,
      xAxis,
      yAxis,
      displayX0,
      displayY0
    );

    for (let y = displayY0; y <= displayY1; y++) {
      for (let x = displayX0; x <= displayX1; x++) {
        const newPointLPS = pointLPS.slice();
        let pixelValue;

        for (let i = 0; i < dimensionsVoxels[1]; i++) {
          const rawPixelValue = JSVolumeRenderer.getRawValue(
            dataset,
            newPointLPS
          );

          if (rawPixelValue > targetValue) {
            pixelValue = getPixelValue(
              rawPixelValue,
              Math.round(255 / Math.max((i * i) / dimensionsVoxels[2] / 100, 1))
            );

            break;
          }
          newPointLPS[0] += direction[0];
          newPointLPS[1] += direction[1];
          newPointLPS[2] += direction[2];
        }

        imageData32[dataIndex++] = pixelValue || 0 | 0;

        pointLPS[0] += xAxis[0];
        pointLPS[1] += xAxis[1];
        pointLPS[2] += xAxis[2];
      }
      pointLPS = JSVolumeRenderer.getPointLPS(
        imageWorldOrigin,
        xAxis,
        yAxis,
        displayX0,
        y
      );
    }

    drawImageData(
      imageData32,
      this.context,
      this.renderingContext,
      displayWidth,
      displayHeight,
      boundedViewportSpace
    );
  }
}
