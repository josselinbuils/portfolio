import { faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import styles from './Logo.module.scss';

export const Logo: FC = () => (
  <figure className={styles.logo}>
    <FontAwesomeIcon icon={faHeadphones} />
  </figure>
);
