import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import type { FC } from 'react';
import { StrictMode } from 'react';
import { Favicon } from '~/platform/components/Favicon/Favicon';
import './index.scss';

// Tells Font Awesome not to add CSS automatically since it is imported above
config.autoAddCss = false;

const MyApp: FC<AppProps> = ({ Component, pageProps }) => (
  <StrictMode>
    <Head>
      <title>Josselin BUILS</title>
      <Favicon />
    </Head>
    <Component {...pageProps} />
  </StrictMode>
);

export default MyApp;
