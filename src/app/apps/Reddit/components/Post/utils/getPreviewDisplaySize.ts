import { Size } from '~/platform/interfaces';

const PREVIEW_MAX_HEIGHT = 300;
const PREVIEW_MAX_WIDTH = 470;

export function getPreviewDisplaySize(width: number, height: number): Size {
  let displayWidth = width;
  let displayHeight = height;

  if (displayWidth > PREVIEW_MAX_WIDTH) {
    displayWidth = PREVIEW_MAX_WIDTH;
    displayHeight = Math.round((height / width) * displayWidth);
  }

  if (displayHeight > PREVIEW_MAX_HEIGHT) {
    displayHeight = PREVIEW_MAX_HEIGHT;
    displayWidth = Math.round((width / height) * displayHeight);
  }

  return { height: displayHeight, width: displayWidth };
}
