import { NormalizedImageFormat } from '~/apps/DICOMViewer/constants';
import { VOILUT } from '~/apps/DICOMViewer/interfaces/VOILUT';
import { Frame } from '~/apps/DICOMViewer/models/Frame';
import { Viewport } from '~/apps/DICOMViewer/models/Viewport';
import { loadVOILUT } from '~/apps/DICOMViewer/utils/loadVOILUT';
import { Renderer } from '../Renderer';
import {
  BoundedViewportSpaceCoordinates,
  ImageSpaceCoordinates,
  RenderingProperties,
} from '../RenderingProperties';
import { getRenderingProperties, validateCamera2D } from '../renderingUtils';
import { drawImageData } from './utils/drawImageData';
import { getCanvasRenderingContexts } from './utils/getCanvasRenderingContexts';
import { getDefaultVOILUT } from './utils/getDefaultVOILUT';

export class JSFrameRenderer implements Renderer {
  private readonly context: CanvasRenderingContext2D;
  private lut?: { table: number[] | number[][]; windowWidth: number };
  private readonly renderingContext: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const { context, renderingContext } = getCanvasRenderingContexts(canvas);
    this.context = context;
    this.renderingContext = renderingContext;
  }

  render(viewport: Viewport): void {
    const { camera, dataset, height, width, windowWidth } = viewport;
    const frame = dataset.findClosestFrame(camera.lookPoint);
    const { imageFormat } = frame;

    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, width, height);

    const renderingProperties = getRenderingProperties(viewport);

    if (renderingProperties === undefined) {
      return;
    }

    validateCamera2D(frame, camera);

    switch (imageFormat) {
      case NormalizedImageFormat.Int16:
        if (this.lut === undefined || this.lut.windowWidth !== windowWidth) {
          this.lut =
            viewport.lutComponents !== undefined
              ? loadVOILUT(viewport.lutComponents, windowWidth)
              : getDefaultVOILUT(windowWidth);
        }

        const { boundedViewportSpace, imageSpace } = renderingProperties;
        const imagePixelsToRender =
          imageSpace.displayWidth * imageSpace.displayHeight;
        const viewportPixelsToRender =
          boundedViewportSpace.imageWidth * boundedViewportSpace.imageHeight;

        if (viewportPixelsToRender < imagePixelsToRender) {
          this.renderViewportPixels(
            frame,
            renderingProperties,
            viewport.getImageZoom()
          );
        } else {
          this.renderImagePixels(frame, renderingProperties);
        }
        break;

      case NormalizedImageFormat.RGB:
        this.renderRGB(frame, renderingProperties);
        break;

      default:
        throw new Error('Unsupported image format');
    }
  }

  private getColorPixelValue(
    leftLimit: number,
    rightLimit: number,
    rawValue: number
  ): number {
    const color = (this.lut as VOILUT).table[
      Math.max(Math.min(rawValue - leftLimit, rightLimit - leftLimit - 1), 0)
    ] as number[];

    return color[0] | (color[1] << 8) | (color[2] << 16) | (255 << 24);
  }

  private getMonochromePixelValue(
    leftLimit: number,
    rightLimit: number,
    rawValue: number
  ): number {
    let intensity = 255;

    if (rawValue < leftLimit) {
      intensity = 0;
    } else if (rawValue < rightLimit) {
      intensity = (this.lut as VOILUT).table[rawValue - leftLimit] as number;
    }

    return intensity | (intensity << 8) | (intensity << 16) | (255 << 24);
  }

  private renderImagePixels(
    frame: Frame,
    renderingProperties: RenderingProperties
  ): void {
    const { columns, pixelData, rescaleIntercept, rescaleSlope } = frame;
    const {
      boundedViewportSpace,
      leftLimit,
      rightLimit,
      imageSpace,
    } = renderingProperties;
    const {
      displayHeight,
      displayWidth,
      displayX0,
      displayX1,
      displayY0,
      displayY1,
    } = imageSpace as ImageSpaceCoordinates;

    const imageData32 = new Uint32Array(displayWidth * displayHeight);
    const getPixelValue = Array.isArray((this.lut as VOILUT).table[0])
      ? this.getColorPixelValue.bind(this, leftLimit, rightLimit)
      : this.getMonochromePixelValue.bind(this, leftLimit, rightLimit);

    let dataIndex = 0;

    for (let y = displayY0; y <= displayY1; y++) {
      for (let x = displayX0; x <= displayX1; x++) {
        const rawValue =
          (pixelData[y * columns + x] * rescaleSlope + rescaleIntercept) | 0;
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

  private renderRGB(
    frame: Frame,
    renderingProperties: RenderingProperties
  ): void {
    const { columns, pixelData, rows } = frame;
    const { viewportSpace } = renderingProperties;

    const pixelDataLength = pixelData.length;
    const imageData32 = new Uint32Array(columns * rows);

    let dataIndex = 0;

    for (let i = 0; i < pixelDataLength; i += 3) {
      imageData32[dataIndex++] =
        pixelData[i] |
        (pixelData[i + 1] << 8) |
        (pixelData[i + 2] << 16) |
        (255 << 24);
    }

    drawImageData(
      imageData32,
      this.context,
      this.renderingContext,
      columns,
      rows,
      viewportSpace
    );
  }

  private renderViewportPixels(
    frame: Frame,
    renderingProperties: RenderingProperties,
    zoom: number
  ): void {
    const { columns, pixelData, rescaleIntercept, rescaleSlope } = frame;
    const {
      boundedViewportSpace,
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

    const viewportSpaceImageX0 = viewportSpace.imageX0;
    const viewportSpaceImageY0 = viewportSpace.imageY0;
    const imageData32 = new Uint32Array(imageWidth * imageHeight);
    const getPixelValue = Array.isArray((this.lut as VOILUT).table[0])
      ? this.getColorPixelValue.bind(this, leftLimit, rightLimit)
      : this.getMonochromePixelValue.bind(this, leftLimit, rightLimit);

    let dataIndex = 0;

    for (let y = imageY0; y <= imageY1; y++) {
      for (let x = imageX0; x <= imageX1; x++) {
        const imageX = ((x - viewportSpaceImageX0) / zoom) | 0;
        const imageY = ((y - viewportSpaceImageY0) / zoom) | 0;
        const rawValue =
          (pixelData[imageY * columns + imageX] * rescaleSlope +
            rescaleIntercept) |
          0;
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
