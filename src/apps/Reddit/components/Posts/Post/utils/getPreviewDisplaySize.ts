import { type ImageResolution } from '@/apps/Reddit/interfaces/RedditPost';
import { type Size } from '@/platform/interfaces/Size';
import { PREVIEW_MAX_HEIGHT, PREVIEW_MAX_WIDTH } from '../constants';

export function getPreviewDisplaySize(
  previewResolution: ImageResolution,
): Size {
  const { height, width } = previewResolution;
  let displayWidth = PREVIEW_MAX_WIDTH;
  let displayHeight = Math.round((height / width) * displayWidth);

  if (displayHeight > PREVIEW_MAX_HEIGHT) {
    displayHeight = PREVIEW_MAX_HEIGHT;
    displayWidth = Math.round((width / height) * displayHeight);
  }

  return { height: displayHeight, width: displayWidth };
}
