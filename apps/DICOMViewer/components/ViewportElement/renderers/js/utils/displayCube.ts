import { Viewport } from '~/apps/DICOMViewer/models/Viewport';
import { Volume } from '~/apps/DICOMViewer/models/Volume';
import { changePointSpace } from '~/apps/DICOMViewer/utils/changePointSpace';
import { V } from '~/apps/DICOMViewer/utils/math/Vector';
import { getLinePlaneIntersection } from '~/apps/DICOMViewer/utils/math/getLinePlaneIntersection';

const STYLE_FRONT = 'rgba(255, 255, 255, .7)';
const STYLE_BEHIND = 'rgba(255, 255, 255, .2)';

export function displayCube(
  viewport: Viewport,
  canvas: HTMLCanvasElement,
  render: () => void
): void {
  const volume = viewport.dataset.volume as Volume;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  const lines = [
    ['x0y0z0', 'x1y0z0'],
    ['x1y0z0', 'x1y1z0'],
    ['x1y1z0', 'x0y1z0'],
    ['x0y1z0', 'x0y0z0'],
    ['x0y0z1', 'x1y0z1'],
    ['x1y0z1', 'x1y1z1'],
    ['x1y1z1', 'x0y1z1'],
    ['x0y1z1', 'x0y0z1'],
    ['x0y0z0', 'x0y0z1'],
    ['x1y0z0', 'x1y0z1'],
    ['x1y1z0', 'x1y1z1'],
    ['x0y1z0', 'x0y1z1'],
  ];

  const cornersDisplay: { [key: string]: number[] } = { ...volume.corners };

  for (const [name, corner] of Object.entries<number[]>(volume.corners)) {
    cornersDisplay[name] = changePointSpace(corner, viewport.dataset, viewport);
  }

  const front: any[] = [];
  const cross: any[] = [];

  context.fillStyle = 'black';
  context.fillRect(0, 0, viewport.width, viewport.height);

  for (const [keyA, keyB] of lines) {
    const corners = volume.corners as { [key: string]: number[] };
    const aLPS = corners[keyA];
    const bLPS = corners[keyB];
    const aDisplay = cornersDisplay[keyA];
    const bDisplay = cornersDisplay[keyB];
    const info = getLineInfo(aLPS, bLPS, viewport);

    if (info.crossesViewport) {
      const pointBehindViewportDisplay = changePointSpace(
        info.pointBehindViewport as number[],
        viewport.dataset,
        viewport
      );
      const pointInFrontOfViewportDisplay = changePointSpace(
        info.pointInFrontOfViewport as number[],
        viewport.dataset,
        viewport
      );
      const pointInViewportDisplay = changePointSpace(
        info.pointInViewport as number[],
        viewport.dataset,
        viewport
      );

      cross.push({
        pointInFrontOfViewportDisplay,
        pointInViewportDisplay,
        pointInViewport: info.pointInViewport,
        pointInFrontOfViewport: info.pointInFrontOfViewport,
      });

      context.beginPath();
      context.moveTo(
        pointBehindViewportDisplay[0],
        pointBehindViewportDisplay[1]
      );
      context.lineTo(pointInViewportDisplay[0], pointInViewportDisplay[1]);
      context.strokeStyle = STYLE_BEHIND;
      context.stroke();
    } else if (info.isInFrontOfViewport) {
      front.push({ aDisplay, bDisplay });
    } else if (info.isBehindViewport) {
      context.beginPath();
      context.moveTo(aDisplay[0], aDisplay[1]);
      context.lineTo(bDisplay[0], bDisplay[1]);
      context.strokeStyle = STYLE_BEHIND;
      context.stroke();
    }
  }

  render();

  for (const {
    pointInFrontOfViewportDisplay,
    pointInViewportDisplay,
  } of cross) {
    context.beginPath();
    context.moveTo(pointInViewportDisplay[0], pointInViewportDisplay[1]);
    context.lineTo(
      pointInFrontOfViewportDisplay[0],
      pointInFrontOfViewportDisplay[1]
    );
    context.strokeStyle = STYLE_FRONT;
    context.stroke();
  }

  for (const { aDisplay, bDisplay } of front) {
    context.beginPath();
    context.moveTo(aDisplay[0], aDisplay[1]);
    context.lineTo(bDisplay[0], bDisplay[1]);
    context.strokeStyle = STYLE_FRONT;
    context.stroke();
  }

  context.beginPath();
  context.arc(
    cornersDisplay.x0y0z0[0],
    cornersDisplay.x0y0z0[1],
    3,
    0,
    Math.PI * 2
  );
  context.fillStyle = STYLE_FRONT;
  context.fill();

  for (const { pointInViewportDisplay } of cross) {
    context.beginPath();
    context.arc(
      pointInViewportDisplay[0],
      pointInViewportDisplay[1],
      3,
      0,
      Math.PI * 2
    );
    context.fillStyle = 'red';
    context.fill();
  }
}

function getLineInfo(a: number[], b: number[], viewport: Viewport): LineInfo {
  const viewportOrigin = viewport.getWorldOrigin();
  const viewportBasis = viewport.getWorldBasis();
  const viewportToADistance = V(a).sub(viewportOrigin).dot(viewportBasis[2]);
  const viewportToBDistance = V(b).sub(viewportOrigin).dot(viewportBasis[2]);
  const crossesViewport =
    Math.sign(viewportToADistance) !== Math.sign(viewportToBDistance);
  const isInFrontOfViewport = !crossesViewport && viewportToADistance < 0;
  const isBehindViewport = !crossesViewport && viewportToADistance > 0;
  const lineInfo: LineInfo = {
    crossesViewport,
    isInFrontOfViewport,
    isBehindViewport,
  };

  if (crossesViewport) {
    const plane = [
      viewportOrigin,
      V(viewportOrigin).add(viewportBasis[0]),
      V(viewportOrigin).add(viewportBasis[1]),
    ];

    lineInfo.pointBehindViewport = viewportToADistance > 0 ? a : b;
    lineInfo.pointInFrontOfViewport = viewportToADistance < 0 ? a : b;
    lineInfo.pointInViewport = getLinePlaneIntersection([a, b], plane);
  }

  return lineInfo;
}

interface LineInfo {
  crossesViewport: boolean;
  isBehindViewport: boolean;
  isInFrontOfViewport: boolean;
  pointBehindViewport?: number[];
  pointInFrontOfViewport?: number[];
  pointInViewport?: number[];
}
