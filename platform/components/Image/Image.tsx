import { FC, useRef } from 'react';
import { useLazy } from '~/platform/hooks/useLazy';
import { generatePreload } from './generatePreload';

export const Image: FC<Props> = ({
  alt,
  loading = 'lazy',
  sizes,
  src,
  srcSet,
  ...forwardedProps
}) => {
  const isLazy = loading === 'lazy';
  const imageElementRef = useRef<HTMLImageElement>(null);
  const { isDisplayed } = useLazy(imageElementRef, isLazy);
  const sourceAttributes = isDisplayed
    ? { src, srcSet }
    : {
        'data-src': src,
        'data-srcset': srcSet,
        src:
          'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==\n',
      };

  return (
    <>
      {!isLazy && generatePreload({ sizes, src, srcSet })}
      <img
        alt={alt}
        ref={imageElementRef}
        sizes={sizes}
        {...sourceAttributes}
        {...forwardedProps}
      />
    </>
  );
};

type Props = JSX.IntrinsicElements['img'] & { alt: string };
