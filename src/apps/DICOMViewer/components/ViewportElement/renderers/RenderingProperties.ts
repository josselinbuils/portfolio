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
