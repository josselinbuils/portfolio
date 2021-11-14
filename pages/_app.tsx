import { config } from '@fortawesome/fontawesome-svg-core';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC } from 'react';

import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
import './index.scss';

// Tells Font Awesome not to add CSS automatically since it is imported above
config.autoAddCss = false;

const MyApp: FC<AppProps> = ({ Component, pageProps }) => (
  <>
    <Head>
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
    </Head>
    <Component {...pageProps} />
  </>
);

export default MyApp;
