import {
  type Image,
  type ImageResolution,
} from '~/apps/Reddit/interfaces/RedditPost';
import { PREVIEW_MAX_HEIGHT, PREVIEW_MAX_WIDTH } from '../constants';

export function getPreviewResolution(preview: Image): ImageResolution {
  const { resolutions = [], source } = preview;

  const bestResolution = resolutions.find(
    ({ height, width }) =>
      height >= PREVIEW_MAX_HEIGHT || width >= PREVIEW_MAX_WIDTH,
  );

  return bestResolution || source;
}
