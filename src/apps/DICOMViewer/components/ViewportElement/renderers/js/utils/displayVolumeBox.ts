import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { computeVolumeBox } from '../../utils/computeVolumeBox';

const STYLE_FRONT = 'rgba(255, 255, 255, 0.4)';
const STYLE_BEHIND = 'rgba(255, 255, 255, 0.2)';

export function displayVolumeBox(
  viewport: Viewport,
  canvas: HTMLCanvasElement,
  render: () => void,
): void {
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const { linesBehindImage, linesInFrontOfImage, points } =
    computeVolumeBox(viewport);

  context.fillStyle = 'black';
  context.fillRect(0, 0, viewport.width, viewport.height);

  for (const lineBehindImage of linesBehindImage) {
    context.beginPath();
    context.moveTo(lineBehindImage[0][0], lineBehindImage[0][1]);
    context.lineTo(lineBehindImage[1][0], lineBehindImage[1][1]);
    context.lineWidth = 2;
    context.strokeStyle = STYLE_BEHIND;
    context.stroke();
  }

  render();

  for (const lineInFrontOfImage of linesInFrontOfImage) {
    context.beginPath();
    context.moveTo(lineInFrontOfImage[0][0], lineInFrontOfImage[0][1]);
    context.lineTo(lineInFrontOfImage[1][0], lineInFrontOfImage[1][1]);
    context.lineWidth = 2;
    context.strokeStyle = STYLE_FRONT;
    context.stroke();
  }

  for (const point of points) {
    context.beginPath();
    context.arc(point[0], point[1], 3, 0, Math.PI * 2);
    context.fillStyle = 'red';
    context.fill();
  }
}
