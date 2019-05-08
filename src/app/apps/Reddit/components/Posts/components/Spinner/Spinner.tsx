import React, { FC } from 'react';
import styles from './Spinner.module.scss';

export const Spinner: FC = () => (
  <div className={styles.spinner}>
    <div className={styles.doubleBounce1} />
    <div className={styles.doubleBounce2} />
  </div>
);
