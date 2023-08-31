import { type BoundedViewportSpaceCoordinates } from '../../utils/getRenderingProperties';

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

export function drawLine(
  context: CanvasRenderingContext2D,
  line: number[][],
  color: string,
  width = 2,
): void {
  context.beginPath();
  context.moveTo(line[0][0], line[0][1]);
  context.lineTo(line[1][0], line[1][1]);
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
}

export function drawPoint(
  context: CanvasRenderingContext2D,
  point: number[],
  color: string,
  radius = 3,
): void {
  context.beginPath();
  context.arc(point[0], point[1], radius, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
}
