import { ViewType } from '../../constants';
import { Dataset, Viewport, Volume } from '../../models';
import { Coordinates } from '../../utils';
import { V } from '../../utils/math';
import { Renderer } from '../Renderer';
import {
  BoundedViewportSpaceCoordinates,
  ImageSpaceCoordinates,
  RenderingProperties,
  ViewportSpaceCoordinates
} from '../RenderingProperties';
import { getRenderingProperties } from '../renderingUtils';
import { drawImageData, getVOILut, VOILut } from './common';
import { displayCube } from './cube';

export class JSVolumeRenderer implements Renderer {
  private background = 0;
  private readonly context: CanvasRenderingContext2D;
  private lut?: { table: number[]; windowWidth: number };
  private readonly renderingContext: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    const renderingContext = (document.createElement(
      'canvas'
    ) as HTMLCanvasElement).getContext('2d');

    if (context === null || renderingContext === null) {
      throw new Error('Unable to retrieve contexts');
    }

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
      this.lut = getVOILut(windowWidth);
    }

    const { boundedViewportSpace, imageSpace } = renderingProperties;
    const imagePixelsToRender =
      imageSpace.displayWidth * imageSpace.displayHeight;
    const viewportPixelsToRender =
      boundedViewportSpace.imageWidth * boundedViewportSpace.imageHeight;

    const renderPixels =
      viewportPixelsToRender < imagePixelsToRender
        ? () => this.renderViewportPixels(viewport, renderingProperties)
        : () => this.renderImagePixels(viewport, renderingProperties);

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

  private getImageWorldBasis(viewport: Viewport): number[][] {
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
      V(cameraBasis[1]).mul(verticalVoxelSpacing)
    ];
  }

  private getImageWorldOrigin(
    viewport: Viewport,
    viewportSpace: ViewportSpaceCoordinates
  ): number[] {
    const { dataset } = viewport;
    return Coordinates.convert(
      [viewportSpace.imageX0, viewportSpace.imageY0, 0],
      viewport,
      dataset
    );
  }

  private getPixelValue(
    rawValue: number,
    leftLimit: number,
    rightLimit: number
  ): number {
    let intensity = 250;

    if (rawValue < leftLimit) {
      intensity = this.background;
    } else if (rawValue < rightLimit) {
      intensity = (this.lut as VOILut).table[rawValue - leftLimit];
    }

    const alpha = rawValue < -(Number.MAX_SAFE_INTEGER - 1) ? 0 : 255;
    return intensity | (intensity << 8) | (intensity << 16) | (alpha << 24);
  }

  private getRawValue(dataset: Dataset, pointLPS: number[]): number {
    const {
      firstVoxelCenter,
      orientation,
      voxelSpacing
    } = dataset.volume as Volume;

    const vector = [
      (pointLPS[0] - firstVoxelCenter[0]) / voxelSpacing[0],
      (pointLPS[1] - firstVoxelCenter[1]) / voxelSpacing[1],
      (pointLPS[2] - firstVoxelCenter[2]) / voxelSpacing[2]
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
      rows
    } = frame;

    const imagePositionToPoint = [
      (pointLPS[0] - imagePosition[0]) / voxelSpacing[0],
      (pointLPS[1] - imagePosition[1]) / voxelSpacing[1],
      (pointLPS[2] - imagePosition[2]) / voxelSpacing[2]
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

  private renderImagePixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties
  ): void {
    const { dataset } = viewport;
    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace
    } = renderingProperties;
    const {
      displayHeight,
      displayWidth,
      displayX0,
      displayX1,
      displayY0,
      displayY1
    } = imageSpace as ImageSpaceCoordinates;

    const imageWorldOrigin = this.getImageWorldOrigin(viewport, viewportSpace);
    const [xAxis, yAxis] = this.getImageWorldBasis(viewport);
    const imageData32 = new Uint32Array(displayWidth * displayHeight);
    let dataIndex = 0;

    for (let y = displayY0; y <= displayY1; y++) {
      for (let x = displayX0; x <= displayX1; x++) {
        const pointLPS = [
          imageWorldOrigin[0] + xAxis[0] * x + yAxis[0] * y,
          imageWorldOrigin[1] + xAxis[1] * x + yAxis[1] * y,
          imageWorldOrigin[2] + xAxis[2] * x + yAxis[2] * y
        ];
        const rawValue = this.getRawValue(dataset, pointLPS);
        imageData32[dataIndex++] = this.getPixelValue(
          rawValue,
          leftLimit,
          rightLimit
        );
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

  private renderViewportPixels(
    viewport: Viewport,
    renderingProperties: RenderingProperties
  ): void {
    const { dataset } = viewport;
    const {
      boundedViewportSpace,
      imageSpace,
      leftLimit,
      rightLimit,
      viewportSpace
    } = renderingProperties;
    const {
      imageHeight,
      imageWidth,
      imageX0,
      imageX1,
      imageY0,
      imageY1
    } = boundedViewportSpace as BoundedViewportSpaceCoordinates;
    const { displayWidth, displayHeight } = imageSpace as ImageSpaceCoordinates;

    const viewportSpaceImageX0 = viewportSpace.imageX0;
    const viewportSpaceImageY0 = viewportSpace.imageY0;
    const imageWorldOrigin = this.getImageWorldOrigin(viewport, viewportSpace);
    let [xAxis, yAxis] = this.getImageWorldBasis(viewport);

    xAxis = V(xAxis).mul(displayWidth / imageWidth);
    yAxis = V(yAxis).mul(displayHeight / imageHeight);

    const imageData32 = new Uint32Array(imageWidth * imageHeight);
    let dataIndex = 0;

    for (let y = imageY0; y <= imageY1; y++) {
      for (let x = imageX0; x <= imageX1; x++) {
        const pixX = x - viewportSpaceImageX0;
        const pixY = y - viewportSpaceImageY0;
        const pointLPS = [
          imageWorldOrigin[0] + xAxis[0] * pixX + yAxis[0] * pixY,
          imageWorldOrigin[1] + xAxis[1] * pixX + yAxis[1] * pixY,
          imageWorldOrigin[2] + xAxis[2] * pixX + yAxis[2] * pixY
        ];
        const rawValue = this.getRawValue(dataset, pointLPS);
        imageData32[dataIndex++] = this.getPixelValue(
          rawValue,
          leftLimit,
          rightLimit
        );
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
