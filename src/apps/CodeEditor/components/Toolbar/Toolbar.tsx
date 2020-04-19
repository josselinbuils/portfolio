import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faStream } from '@fortawesome/free-solid-svg-icons/faStream';
import React, { FC } from 'react';
import { Button } from './components';

import styles from './Toolbar.module.scss';

export const Toolbar: FC<Props> = ({ onClickFormat, onClickPlay }) => {
  return (
    <div className={styles.toolbar}>
      <Button icon={faPlay} onClick={onClickPlay} title="Execute" />
      <Button icon={faStream} onClick={onClickFormat} title="Format" />
    </div>
  );
};

interface Props {
  onClickFormat(): void;
  onClickPlay(): void;
}
