import React, { FC } from 'react';

import styles from './NoScriptAlert.module.scss';

export const NoScriptAlert: FC = () => (
  <noscript className={styles.noScriptAlert}>
    You need to enable JavaScript to run this app.
  </noscript>
);
