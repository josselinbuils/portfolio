import { config } from '@fortawesome/fontawesome-svg-core';
import { AppProps } from 'next/app';
import { FC } from 'react';

import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
import './index.scss';

// Tells Font Awesome not to add CSS automatically since it is imported above
config.autoAddCss = false;

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
