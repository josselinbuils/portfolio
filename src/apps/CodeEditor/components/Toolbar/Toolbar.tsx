import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import React, { FC } from 'react';
import { Button } from './components';

import styles from './Toolbar.module.scss';

export const Toolbar: FC<Props> = ({ onClickPlay }) => {
  return (
    <div className={styles.toolbar}>
      <Button icon={faPlay} onClick={onClickPlay} />
    </div>
  );
};

interface Props {
  onClickPlay(): void;
}
