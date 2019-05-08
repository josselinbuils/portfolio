import React, { FC } from 'react';
import styles from './Logo.module.scss';

export const Logo: FC = () => (
  <div className={styles.logo}>
    <i className="fab fa-reddit-alien" />
  </div>
);
