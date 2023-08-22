import { type BoundedViewportSpaceCoordinates } from '../../RenderingProperties';

export function drawImageData(
  data: Uint32Array,
  context: CanvasRenderingContext2D,
  renderingContext: CanvasRenderingContext2D,
  width: number,
  height: number,
  drawSpace: BoundedViewportSpaceCoordinates,
): void {
  const imageData = new ImageData(
    new Uint8ClampedArray(data.buffer),
    width,
    height,
  );

  renderingContext.canvas.width = width;
  renderingContext.canvas.height = height;
  renderingContext.putImageData(imageData, 0, 0);

  const { imageX0, imageY0, imageWidth, imageHeight } = drawSpace;
  context.drawImage(
    renderingContext.canvas,
    imageX0,
    imageY0,
    imageWidth,
    imageHeight,
  );
}
