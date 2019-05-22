import React, { FC } from 'react';
import styles from './Logo.module.scss';

export const Logo: FC = () => (
  <figure className={styles.logo}>
    <i className="fas fa-headphones" />
  </figure>
);
