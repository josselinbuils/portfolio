import { RendererType, ViewType } from '@/apps/DICOMViewer/constants';
import { type Camera } from '../../../models/Camera';
import { type Frame } from '../../../models/Frame';
import { Viewport } from '../../../models/Viewport';
import { type Volume } from '../../../models/Volume';
import { changePointSpace } from '../../../utils/changePointSpace';
import { V } from '../../../utils/math/Vector';
import {
  type BoundedViewportSpaceCoordinates,
  type ImageSpaceCoordinates,
  type RenderingProperties,
  type ViewportSpaceCoordinates,
} from './RenderingProperties';

export function getRenderingProperties(
  viewport: Viewport,
): RenderingProperties | undefined {
  const {
    camera,
    dataset,
    height,
    width,
    viewType,
    windowCenter,
    windowWidth,
  } = viewport;

  const leftLimit = Math.floor(windowCenter - windowWidth / 2);
  const rightLimit = Math.floor(windowCenter + windowWidth / 2);

  let imageWidth: number;
  let imageHeight: number;
  let viewportSpaceImageWidth: number;
  let viewportSpaceImageHeight: number;
  let viewportSpaceImageX0: number;
  let viewportSpaceImageY0: number;

  if (viewType === ViewType.Native) {
    const frame = dataset.findClosestFrame(camera.lookPoint);
    const { columns, imageCenter, rows } = frame;
    const lookPointViewport = changePointSpace(
      camera.lookPoint,
      dataset,
      viewport,
    );
    const frameCenterViewport = changePointSpace(
      imageCenter,
      dataset,
      viewport,
    );
    const zoom = viewport.getImageZoom();

    imageWidth = columns;
    imageHeight = rows;
    viewportSpaceImageWidth = Math.round(columns * zoom);
    viewportSpaceImageHeight = Math.round(rows * zoom);

    viewportSpaceImageX0 =
      (width - viewportSpaceImageWidth) / 2 +
      frameCenterViewport[0] -
      lookPointViewport[0];

    viewportSpaceImageY0 =
      (height - viewportSpaceImageHeight) / 2 +
      frameCenterViewport[1] -
      lookPointViewport[1];
  } else {
    let viewportToUse = viewport;

    if ([ViewType.VolumeBones, ViewType.VolumeSkin].includes(viewType)) {
      const fakeViewport = Viewport.create(
        dataset,
        ViewType.Coronal,
        RendererType.JavaScript,
      );
      fakeViewport.width = viewport.width;
      fakeViewport.height = viewport.height;
      viewportToUse = fakeViewport;
    }
    const imageDimensions = getImageDimensions(viewportToUse);

    if (imageDimensions === undefined) {
      return undefined;
    }

    imageWidth = imageDimensions.width;
    imageHeight = imageDimensions.height;
    ({
      viewportSpaceImageHeight,
      viewportSpaceImageWidth,
      viewportSpaceImageX0,
      viewportSpaceImageY0,
    } = imageDimensions);
  }

  const viewportSpace = computeViewportSpaceCoordinates(
    viewport,
    viewportSpaceImageWidth,
    viewportSpaceImageHeight,
    viewportSpaceImageX0,
    viewportSpaceImageY0,
  );

  const { imageX0, imageY0, imageX1, imageY1, lastPixelX, lastPixelY } =
    viewportSpace;

  const isImageInViewport =
    imageY0 <= lastPixelY &&
    imageX0 <= lastPixelX &&
    imageY1 > 0 &&
    imageX1 > 0;

  if (!isImageInViewport) {
    return undefined;
  }

  const boundedViewportSpace =
    computeBoundedViewportSpaceCoordinates(viewportSpace);
  const imageSpace = computeImageSpace(imageWidth, imageHeight, viewportSpace);

  return {
    boundedViewportSpace,
    imageSpace,
    leftLimit,
    rightLimit,
    viewportSpace,
  };
}

export function validateCamera2D(frame: Frame, camera: Camera): void {
  const isDirectionValid =
    Math.abs(V(camera.getDirection()).angle(frame.imageNormal)) <
    Number.EPSILON;

  if (!isDirectionValid) {
    throw new Error('Camera direction is not collinear with the frame normal');
  }

  // Frame vertical axis is inverted compared to axial view
  const angle =
    Math.abs(V(camera.upVector).angle(frame.imageOrientation[1])) - Math.PI;
  const isUpVectorValid = angle < Number.EPSILON;

  if (!isUpVectorValid) {
    throw new Error(
      `Up vector is not collinear to the frame orientation (${angle} should be < ${Number.EPSILON})`,
    );
  }

  const cameraFrameDistance = Math.abs(
    V(camera.lookPoint).sub(frame.imagePosition).dot(camera.getDirection()),
  );

  if (cameraFrameDistance > frame.spacingBetweenSlices) {
    throw new Error(
      `lookPoint shall be on the frame (${cameraFrameDistance}mm)`,
    );
  }
}

function computeBoundedViewportSpaceCoordinates(
  viewportSpace: ViewportSpaceCoordinates,
): BoundedViewportSpaceCoordinates {
  const imageX0 = Math.max(viewportSpace.imageX0, 0);
  const imageY0 = Math.max(viewportSpace.imageY0, 0);

  const imageX1 = Math.min(viewportSpace.imageX1, viewportSpace.lastPixelX);
  const imageY1 = Math.min(viewportSpace.imageY1, viewportSpace.lastPixelY);

  const imageWidth = imageX1 - imageX0 + 1;
  const imageHeight = imageY1 - imageY0 + 1;

  return { imageX0, imageY0, imageX1, imageY1, imageWidth, imageHeight };
}

function computeImageSpace(
  imageWidth: number,
  imageHeight: number,
  viewportSpace: ViewportSpaceCoordinates,
): ImageSpaceCoordinates {
  const horizontalZoom = viewportSpace.imageWidth / imageWidth;
  const verticalZoom = viewportSpace.imageHeight / imageHeight;

  const displayX0 =
    viewportSpace.imageX0 < 0
      ? Math.round(-viewportSpace.imageX0 / horizontalZoom)
      : 0;
  const displayY0 =
    viewportSpace.imageY0 < 0
      ? Math.round(-viewportSpace.imageY0 / verticalZoom)
      : 0;

  const displayX1 =
    viewportSpace.imageX1 > viewportSpace.lastPixelX
      ? imageWidth -
        Math.round(
          (viewportSpace.imageX1 - viewportSpace.lastPixelX) / horizontalZoom,
        ) -
        1
      : imageWidth - 1;

  const displayY1 =
    viewportSpace.imageY1 > viewportSpace.lastPixelY
      ? imageHeight -
        Math.round(
          (viewportSpace.imageY1 - viewportSpace.lastPixelY) / verticalZoom,
        ) -
        1
      : imageHeight - 1;

  const displayWidth = displayX1 - displayX0 + 1;
  const displayHeight = displayY1 - displayY0 + 1;

  return {
    displayX0,
    displayY0,
    displayX1,
    displayY1,
    displayWidth,
    displayHeight,
  };
}

function computeViewportSpaceCoordinates(
  viewport: Viewport,
  imageWidth: number,
  imageHeight: number,
  viewportSpaceImageX0: number,
  viewportSpaceImageY0: number,
): ViewportSpaceCoordinates {
  const { height, width } = viewport;

  const imageX0 = Math.round(viewportSpaceImageX0);
  const imageY0 = Math.round(viewportSpaceImageY0);

  const imageX1 = imageX0 + imageWidth - 1;
  const imageY1 = imageY0 + imageHeight - 1;

  const lastPixelX = width - 1;
  const lastPixelY = height - 1;

  return {
    imageX0,
    imageY0,
    imageX1,
    imageY1,
    imageWidth,
    imageHeight,
    lastPixelX,
    lastPixelY,
  };
}

function getImageDimensions(viewport: Viewport):
  | {
      height: number;
      heightMm: number;
      viewportSpaceImageHeight: number;
      viewportSpaceImageWidth: number;
      viewportSpaceImageX0: number;
      viewportSpaceImageY0: number;
      width: number;
    }
  | undefined {
  // Compute volume limits in computer service
  const { camera, dataset } = viewport;
  const { voxelSpacing } = dataset;
  const viewportBasis = viewport.getWorldBasis();
  const viewportOrigin = viewport.getWorldOrigin();
  const plane = [
    viewportOrigin,
    V(viewportOrigin).add(viewportBasis[0]),
    V(viewportOrigin).add(viewportBasis[1]),
  ];
  const intersections = (dataset.volume as Volume).getIntersections(plane);

  if (intersections.length === 0) {
    return undefined;
  }

  const intersectionsCamera = intersections.map((i) =>
    changePointSpace(i, dataset, camera),
  );
  const intersectionsCameraHorizontal = intersectionsCamera.map((i) => i[0]);
  const intersectionsCameraVertical = intersectionsCamera.map((i) => i[1]);
  const halfSpacing = V(dataset.voxelSpacing).mul(0.5);
  const halfHorizontalSpacing = Math.abs(
    halfSpacing.dot(V(viewportBasis[0]).normalize()),
  );
  const halfVerticalSpacing = Math.abs(
    halfSpacing.dot(V(viewportBasis[1]).normalize()),
  );
  const maxHorizontalMm =
    Math.max(...intersectionsCameraHorizontal) + halfHorizontalSpacing;
  const minHorizontalMm =
    Math.min(...intersectionsCameraHorizontal) - halfHorizontalSpacing;
  const maxVerticalMm =
    Math.max(...intersectionsCameraVertical) + halfVerticalSpacing;
  const minVerticalMm =
    Math.min(...intersectionsCameraVertical) - halfVerticalSpacing;
  const widthMm = Math.round(maxHorizontalMm - minHorizontalMm);
  const heightMm = Math.round(maxVerticalMm - minVerticalMm);
  const width = Math.round(
    widthMm / Math.abs(V(voxelSpacing).dot(V(viewportBasis[0]).normalize())),
  );
  const height = Math.round(
    heightMm / Math.abs(V(voxelSpacing).dot(V(viewportBasis[1]).normalize())),
  );

  if (width === 0 || height === 0) {
    return undefined;
  }

  const intersectionsDisplay = intersections.map((i) =>
    changePointSpace(i, dataset, viewport),
  );
  const intersectionsDisplayHorizontal = intersectionsDisplay.map((i) => i[0]);
  const intersectionsDisplayVertical = intersectionsDisplay.map((i) => i[1]);
  const viewportSpaceImageX0 = Math.min(...intersectionsDisplayHorizontal);
  const viewportSpaceImageY0 = Math.min(...intersectionsDisplayVertical);
  const viewportSpaceImageX1 = Math.max(...intersectionsDisplayHorizontal);
  const viewportSpaceImageY1 = Math.max(...intersectionsDisplayVertical);
  const viewportSpaceImageWidth = Math.round(
    viewportSpaceImageX1 - viewportSpaceImageX0 + 1,
  );
  const viewportSpaceImageHeight = Math.round(
    viewportSpaceImageY1 - viewportSpaceImageY0 + 1,
  );

  return {
    height,
    heightMm,
    viewportSpaceImageHeight,
    viewportSpaceImageWidth,
    viewportSpaceImageX0,
    viewportSpaceImageY0,
    width,
  };
}
