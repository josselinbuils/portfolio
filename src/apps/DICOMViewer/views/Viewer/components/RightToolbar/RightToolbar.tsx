import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';

import styles from './RightToolbar.module.scss';

export const RightToolbar: FC<Props> = ({ onClickPalette }) => (
  <div className={styles.toolbar}>
    <button className={styles.button} onClick={onClickPalette}>
      <FontAwesomeIcon icon={faPalette} />
    </button>
  </div>
);

interface Props {
  onClickPalette(): void;
}
