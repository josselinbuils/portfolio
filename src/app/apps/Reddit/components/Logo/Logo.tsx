import { faRedditAlien } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import styles from './Logo.module.scss';

export const Logo: FC = () => (
  <figure className={styles.logo}>
    <FontAwesomeIcon className={styles.icon} icon={faRedditAlien} />
  </figure>
);
