import React, { FC } from 'react';

export const Picture: FC<Props> = ({ alt, className, src, webpSrc }) => (
  <picture className={className}>
    <source srcSet={webpSrc} type="image/webp" />
    <img src={src} alt={alt} />
  </picture>
);

interface Props {
  alt: string;
  className?: string;
  src: string;
  webpSrc: string;
}
