import React, { FC } from 'react';
import styles from './JamendoLink.module.scss';

export const JamendoLink: FC = () => (
  <a
    className={styles.brand}
    href="https://www.jamendo.com"
    rel="noopener noreferrer"
    target="_blank"
  >
    powered by jamendo
  </a>
);
