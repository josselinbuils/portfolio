import { config } from '@fortawesome/fontawesome-svg-core';
import { AppProps } from 'next/app';
import { FC, StrictMode } from 'react';
import { Favicon } from '~/platform/components/Favicon/Favicon';

import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
import './index.scss';

// Tells Font Awesome not to add CSS automatically since it is imported above
config.autoAddCss = false;

const MyApp: FC<AppProps> = ({ Component, pageProps }) => (
  <StrictMode>
    <Favicon />
    <Component {...pageProps} />
  </StrictMode>
);

export default MyApp;
