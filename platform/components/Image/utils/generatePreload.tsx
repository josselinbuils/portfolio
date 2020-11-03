import { ReactElement } from 'react';
import Head from 'next/head';
import { ImageProps } from '../ImageProps';

export function generatePreload({
  src,
  srcSet,
  sizes,
}: Pick<ImageProps, 'sizes' | 'src' | 'srcSet'>): ReactElement {
  return (
    <Head>
      <link
        rel="preload"
        as="image"
        href={src}
        // @ts-ignore: imagesrcset and imagesizes not yet in the link element type
        imagesrcset={srcSet}
        imagesizes={sizes}
      />
    </Head>
  );
}
