import React, { FC, MouseEvent } from 'react';
import { MouseButton } from '~/platform/constants';
import styles from './ResizeArea.module.scss';

export const ResizeArea: FC<Props> = ({ onResizeStart }) => {
  const resizeStartHandler = (downEvent: MouseEvent) => {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }
    downEvent.preventDefault();
    onResizeStart(downEvent);
  };

  return <div className={styles.resize} onMouseDown={resizeStartHandler} />;
};

interface Props {
  onResizeStart(downEvent: MouseEvent): void;
}
