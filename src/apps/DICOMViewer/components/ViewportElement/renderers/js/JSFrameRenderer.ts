import { type VOILUT } from '@/apps/DICOMViewer/interfaces/VOILUT';
import { type Frame } from '@/apps/DICOMViewer/models/Frame';
import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { loadVOILUT } from '@/apps/DICOMViewer/utils/loadVOILUT';
import { type Renderer } from '../Renderer';
import { type RenderingProperties } from '../RenderingProperties';
import { getRenderingProperties, validateCamera2D } from '../renderingUtils';
import { drawImageData } from './utils/drawImageData';
import { getCanvasRenderingContexts } from './utils/getCanvasRenderingContexts';
import { getDefaultVOILUT } from './utils/getDefaultVOILUT';

export class JSFrameRenderer implements Renderer {
  // eslint-disable-next-line react/static-property-placement
  private readonly context: CanvasRenderingContext2D;
  private lut?: VOILUT;
  private readonly renderingContext: CanvasRenderingContext2D;
  private unsubscribeToViewportUpdates?: () => void;

  constructor(canvas: HTMLCanvasElement) {
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
      if (key === 'lutComponents') {
        delete this.lut;
      }
    });
  }

  render(viewport: Viewport): void {
    const { camera, dataset, height, width, windowWidth } = viewport;
    const frame = dataset.findClosestFrame(camera.lookPoint);

    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, width, height);

    const renderingProperties = getRenderingProperties(viewport);

    if (renderingProperties === undefined) {
      return;
    }

    validateCamera2D(frame, camera);

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
        viewport.getImageZoom(),
      );
    } else {
      this.renderImagePixels(frame, renderingProperties);
    }
  }

  private getPixelValue(
    leftLimit: number,
    rightLimit: number,
    rawValue: number,
  ): number {
    const color =
      this.lut!.table[
        Math.max(Math.min(rawValue - leftLimit, rightLimit - leftLimit - 1), 0)
      ];
    return color[0] | (color[1] << 8) | (color[2] << 16) | (255 << 24);
  }

  private renderImagePixels(
    frame: Frame,
    renderingProperties: RenderingProperties,
  ): void {
    const { columns, pixelData, rescaleIntercept, rescaleSlope } = frame;

    if (pixelData === undefined) {
      return;
    }

    const { boundedViewportSpace, leftLimit, rightLimit, imageSpace } =
      renderingProperties;

    const displayX0 = Math.ceil(imageSpace.displayX0);
    const displayY0 = Math.ceil(imageSpace.displayY0);

    const displayWidth = Math.floor(imageSpace.displayWidth);
    const displayHeight = Math.floor(imageSpace.displayHeight);

    const displayX1 = displayX0 + displayWidth - 1;
    const displayY1 = displayY0 + displayHeight - 1;

    const imageData32 = new Uint32Array(displayWidth * displayHeight);
    const getPixelValue = this.getPixelValue.bind(this, leftLimit, rightLimit);

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
      boundedViewportSpace,
    );
  }

  private renderViewportPixels(
    frame: Frame,
    renderingProperties: RenderingProperties,
    zoom: number,
  ): void {
    const { columns, pixelData, rescaleIntercept, rescaleSlope } = frame;

    if (pixelData === undefined) {
      return;
    }

    const { boundedViewportSpace, leftLimit, rightLimit, viewportSpace } =
      renderingProperties;

    const imageX0 = Math.ceil(boundedViewportSpace.imageX0);
    const imageY0 = Math.ceil(boundedViewportSpace.imageY0);

    const imageWidth = Math.floor(boundedViewportSpace.imageWidth);
    const imageHeight = Math.floor(boundedViewportSpace.imageHeight);

    const imageX1 = imageX0 + imageWidth - 1;
    const imageY1 = imageY0 + imageHeight - 1;

    const viewportSpaceImageX0 = viewportSpace.imageX0;
    const viewportSpaceImageY0 = viewportSpace.imageY0;

    const imageData32 = new Uint32Array(imageWidth * imageHeight);
    const getPixelValue = this.getPixelValue.bind(this, leftLimit, rightLimit);

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
      boundedViewportSpace,
    );
  }
}
