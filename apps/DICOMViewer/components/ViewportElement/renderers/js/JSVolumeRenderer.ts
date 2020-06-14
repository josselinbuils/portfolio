import { ViewType } from '~/apps/DICOMViewer/constants';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces/LUTComponent';
import { VOILUT } from '~/apps/DICOMViewer/interfaces/VOILUT';
import { Dataset } from '~/apps/DICOMViewer/models/Dataset';
import { Viewport } from '~/apps/DICOMViewer/models/Viewport';
import { Volume } from '~/apps/DICOMViewer/models/Volume';
import { changePointSpace } from '~/apps/DICOMViewer/utils/changePointSpace';
import { loadVOILUT } from '~/apps/DICOMViewer/utils/loadVOILUT';
import { V } from '~/apps/DICOMViewer/utils/math/Vector';
import { Renderer } from '../Renderer';
import {
  BoundedViewportSpaceCoordinates,
  ImageSpaceCoordinates,
  RenderingProperties,
  ViewportSpaceCoordinates,
} from '../RenderingProperties';
import { getRenderingProperties } from '../renderingUtils';
import { displayCube } from './utils/displayCube';
import { drawImageData } from './utils/drawImageData';
import { getCanvasRenderingContexts } from './utils/getCanvasRenderingContexts';
import { getDefaultVOILUT } from './utils/getDefaultVOILUT';

const skinLUTComponents = [
  { id: '0', start: 10, end: 135, color: [235, 190, 180] },
] as LUTComponent[];

export class JSVolumeRenderer implements Renderer {
  private background = 0;
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
      // tslint:disable-next-line:prefer-conditional-expression
      if (viewport.lutComponents !== undefined) {
        this.lut = loadVOILUT(viewport.lutComponents, windowWidth);
      } else if (viewport.viewType === ViewType.VolumeSkin) {
        this.lut = loadVOILUT(skinLUTComponents, windowWidth);
      } else {
        this.lut = getDefaultVOILUT(windowWidth);
      }
    }

    const { boundedViewportSpace, imageSpace } = renderingProperties;
    const imagePixelsToRender =
      imageSpace.displayWidth * imageSpace.displayHeight;
    const viewportPixelsToRender =
      boundedViewportSpace.imageWidth * boundedViewportSpace.imageHeight;
    let renderPixels;

    if (
      [ViewType.VolumeBones, ViewType.VolumeSkin].includes(viewport.viewType)
    ) {
      renderPixels = () =>
        this.render3DImagePixels(viewport, renderingProperties);
    } else {
      renderPixels =
        viewportPixelsToRender < imagePixelsToRender
          ? () => this.renderMPRViewportPixels(viewport, renderingProperties)
          : () => this.renderMPRImagePixels(viewport, renderingProperties);
    }

    if (viewport.viewType === ViewType.Oblique) {
      this.background = 10;
      displayCube(viewport, this.canvas, renderPixels);
    } else {
      this.background = 0;
      this.context.fillStyle = 'black';
      this.context.fillRect(0, 0, viewport.width, viewport.height);
      renderPixels();
    }
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
      intensity = this.background;
    } else if (rawValue < rightLimit) {
      intensity = (this.lut as VOILUT).table[rawValue - leftLimit] as number;
    }

    const alpha = rawValue < -(Number.MAX_SAFE_INTEGER - 1) ? 0 : baseAlpha;
    return intensity | (intensity << 8) | (intensity << 16) | (alpha << 24);
  }

  private render3DImagePixels(
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
    const targetRatio = viewport.viewType === ViewType.VolumeBones ? 1.1 : 100;
    const targetValue = leftLimit + (rightLimit - leftLimit) / targetRatio;
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

  private renderMPRImagePixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties
  ): void {
    const { dataset } = viewport;
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

    for (let y = displayY0; y <= displayY1; y++) {
      for (let x = displayX0; x <= displayX1; x++) {
        const pointLPS = JSVolumeRenderer.getPointLPS(
          imageWorldOrigin,
          xAxis,
          yAxis,
          x,
          y
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
      boundedViewportSpace
    );
  }

  private renderMPRViewportPixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties
  ): void {
    const { dataset } = viewport;
    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace,
    } = renderingProperties;
    const {
      imageHeight,
      imageWidth,
      imageX0,
      imageX1,
      imageY0,
      imageY1,
    } = boundedViewportSpace as BoundedViewportSpaceCoordinates;
    const { displayWidth, displayHeight } = imageSpace as ImageSpaceCoordinates;

    const viewportSpaceImageX0 = viewportSpace.imageX0;
    const viewportSpaceImageY0 = viewportSpace.imageY0;
    const imageWorldOrigin = JSVolumeRenderer.getImageWorldOrigin(
      viewport,
      viewportSpace
    );
    let [xAxis, yAxis] = JSVolumeRenderer.getImageWorldBasis(viewport);

    xAxis = V(xAxis).mul(displayWidth / imageWidth);
    yAxis = V(yAxis).mul(displayHeight / imageHeight);

    const imageData32 = new Uint32Array(imageWidth * imageHeight);
    const getPixelValue = this.createPixelValueGetter(leftLimit, rightLimit);
    let dataIndex = 0;

    for (let y = imageY0; y <= imageY1; y++) {
      for (let x = imageX0; x <= imageX1; x++) {
        const pointLPS = JSVolumeRenderer.getPointLPS(
          imageWorldOrigin,
          xAxis,
          yAxis,
          x - viewportSpaceImageX0,
          y - viewportSpaceImageY0
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
      boundedViewportSpace
    );
  }
}
