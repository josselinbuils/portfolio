import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';
import { type Volume } from '@/apps/DICOMViewer/models/Volume';
import { changePointSpace } from '@/apps/DICOMViewer/utils/changePointSpace';
import { V } from '@/apps/DICOMViewer/utils/math/Vector';
import { getLinePlaneIntersection } from '@/apps/DICOMViewer/utils/math/getLinePlaneIntersection';

export type Point = number[];
export type Line = Point[];

export function computeVolumeBox(viewport: Viewport): {
  linesBehindImage: Line[];
  linesInFrontOfImage: Line[];
  points: Point[];
} {
  const volume = viewport.dataset.volume as Volume;

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

  const linesBehindImage: Line[] = [];
  const linesInFrontOfImage: Line[] = [];
  const points: Point[] = [];

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
        viewport,
      );
      const pointInFrontOfViewportDisplay = changePointSpace(
        info.pointInFrontOfViewport as number[],
        viewport.dataset,
        viewport,
      );
      const pointInViewportDisplay = changePointSpace(
        info.pointInViewport as number[],
        viewport.dataset,
        viewport,
      );

      linesBehindImage.push([
        pointBehindViewportDisplay,
        pointInViewportDisplay,
      ]);
      linesInFrontOfImage.push([
        pointInViewportDisplay,
        pointInFrontOfViewportDisplay,
      ]);
      points.push(pointInViewportDisplay);
    } else if (info.isInFrontOfViewport) {
      linesInFrontOfImage.push([aDisplay, bDisplay]);
    } else if (info.isBehindViewport) {
      linesBehindImage.push([aDisplay, bDisplay]);
    }
  }

  return { linesBehindImage, linesInFrontOfImage, points };
}

interface LineInfo {
  crossesViewport: boolean;
  isBehindViewport: boolean;
  isInFrontOfViewport: boolean;
  pointBehindViewport?: number[];
  pointInFrontOfViewport?: number[];
  pointInViewport?: number[];
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
