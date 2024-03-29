import { type Viewport } from '../../../../models/Viewport';
import { changePointSpace } from '../../../../utils/changePointSpace';
import { V } from '../../../../utils/math/Vector';

export interface RenderingProperties {
  boundedViewportSpace: BoundedViewportSpaceCoordinates;
  imageSpace: ImageSpaceCoordinates;
  leftLimit: number;
  rightLimit: number;
  viewportSpace: ViewportSpaceCoordinates;
}

/**
 * Origin: top left corner of the image
 * Unit: image pixel
 *
 * Coordinates cannot be outside the viewport.
 */
export interface ImageSpaceCoordinates {
  // Position of the first displayed pixel in the image space
  displayX0: number;
  displayY0: number;

  // Position of the last displayed pixel in the image space
  displayX1: number;
  displayY1: number;

  // Dimensions of the image in the image space
  displayWidth: number;
  displayHeight: number;
}

/**
 * Origin: top left corner of the viewport
 * Unit: viewport pixel
 *
 * Coordinates cannot be outside the viewport.
 */
export interface BoundedViewportSpaceCoordinates {
  // Position of the first image pixel in the viewport
  imageX0: number;
  imageY0: number;

  // Position of the last image pixel in the viewport
  imageX1: number;
  imageY1: number;

  // Dimensions of the image in the viewport space
  imageWidth: number;
  imageHeight: number;
}

/**
 * Origin: top left corner of the viewport
 * Unit: viewport pixel
 */
export interface ViewportSpaceCoordinates {
  // Position of the first image pixel in the viewport space (can be outside the viewport)
  imageX0: number;
  imageY0: number;

  // Position of the last image pixel in the viewport space (can be outside the viewport)
  imageX1: number;
  imageY1: number;

  // Dimensions of the image in the viewport
  imageWidth: number;
  imageHeight: number;

  // Position of the last pixel in the viewport
  lastPixelX: number;
  lastPixelY: number;
}

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

  if (viewType === 'native') {
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
    viewportSpaceImageWidth = columns * zoom;
    viewportSpaceImageHeight = rows * zoom;

    viewportSpaceImageX0 =
      (width - viewportSpaceImageWidth) / 2 +
      frameCenterViewport[0] -
      lookPointViewport[0];

    viewportSpaceImageY0 =
      (height - viewportSpaceImageHeight) / 2 +
      frameCenterViewport[1] -
      lookPointViewport[1];
  } else {
    const imageDimensions = getImageDimensions(viewport);

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
    viewportSpace.imageX0 < 0 ? -viewportSpace.imageX0 / horizontalZoom : 0;
  const displayY0 =
    viewportSpace.imageY0 < 0 ? -viewportSpace.imageY0 / verticalZoom : 0;

  const displayX1 =
    viewportSpace.imageX1 > viewportSpace.lastPixelX
      ? imageWidth -
        (viewportSpace.imageX1 - viewportSpace.lastPixelX) / horizontalZoom -
        1
      : imageWidth - 1;

  const displayY1 =
    viewportSpace.imageY1 > viewportSpace.lastPixelY
      ? imageHeight -
        (viewportSpace.imageY1 - viewportSpace.lastPixelY) / verticalZoom -
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

  const imageX0 = viewportSpaceImageX0;
  const imageY0 = viewportSpaceImageY0;

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
  const intersections = viewport.is3D()
    ? dataset.volume!.getProjections(plane)
    : dataset.volume!.getIntersections(plane);

  if (intersections.length === 0) {
    return undefined;
  }

  const intersectionsCamera = intersections.map((i) =>
    changePointSpace(i, dataset, camera),
  );
  const intersectionsCameraHorizontal = intersectionsCamera.map((i) => i[0]);
  const intersectionsCameraVertical = intersectionsCamera.map((i) => i[1]);
  const halfSpacing = V(dataset.voxelSpacing).scale(0.5);

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

  const widthMm = maxHorizontalMm - minHorizontalMm;
  const heightMm = maxVerticalMm - minVerticalMm;

  const width =
    widthMm / Math.abs(V(voxelSpacing).dot(V(viewportBasis[0]).normalize()));

  const height =
    heightMm / Math.abs(V(voxelSpacing).dot(V(viewportBasis[1]).normalize()));

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

  const viewportSpaceImageWidth =
    viewportSpaceImageX1 - viewportSpaceImageX0 + 1;

  const viewportSpaceImageHeight =
    viewportSpaceImageY1 - viewportSpaceImageY0 + 1;

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
