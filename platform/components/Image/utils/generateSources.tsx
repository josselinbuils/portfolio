import { ImageProps } from '../ImageProps';
import { getMimeType } from './getMimeType';

/**
 * Generates 1 source by mime type and adds automatically type attribute.
 */
export function generateSources({
  fallbackSrc,
  src,
  srcSet,
}: Pick<ImageProps, 'fallbackSrc' | 'src' | 'srcSet'>): Source[] {
  // If no fallbackSrc, src will be put directly in the img tag
  const sources = [fallbackSrc && src, srcSet]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((source) => source.trim())
    .filter(Boolean);
  const groupedSources = {} as { [mimeType: string]: string[] };

  sources.forEach((source) => {
    const filename = source.split(' ')[0];
    const mimeType = getMimeType(filename);

    if (groupedSources[mimeType] === undefined) {
      groupedSources[mimeType] = [];
    }
    groupedSources[mimeType].push(source);
  });

  return Object.entries(groupedSources).map(([mimeType, extensionSources]) => ({
    srcSet: extensionSources.join(', '),
    type: mimeType,
  }));
}

interface Source {
  srcSet: string;
  type: string;
}
