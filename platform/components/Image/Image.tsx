import { FC, useRef } from 'react';
import { useLazy } from '~/platform/hooks/useLazy';
import { ImageProps } from './ImageProps';
import { generatePreload } from './utils/generatePreload';
import { generateSources } from './utils/generateSources';

const PLACE_HOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const Image: FC<ImageProps> = ({
  alt,
  fallbackSrc,
  loading = 'lazy',
  sizes,
  src,
  srcSet,
  ...forwardedProps
}) => {
  const isLazy = loading === 'lazy';
  const imageElementRef = useRef<HTMLImageElement>(null);
  const { hasBeenDisplayed } = useLazy(imageElementRef, isLazy);
  const sources = hasBeenDisplayed
    ? generateSources({ fallbackSrc, src, srcSet })
    : [];
  const img = (
    <img
      alt={alt}
      ref={imageElementRef}
      sizes={sizes}
      src={hasBeenDisplayed ? fallbackSrc || src : PLACE_HOLDER}
      {...forwardedProps}
    />
  );

  return (
    <>
      {!isLazy && generatePreload({ sizes, src, srcSet })}
      {sources.length > 0 ? (
        <picture>
          {sources.map((sourceProps) => (
            <source key={sourceProps.srcSet} {...sourceProps} />
          ))}
          {img}
        </picture>
      ) : (
        img
      )}
    </>
  );
};
