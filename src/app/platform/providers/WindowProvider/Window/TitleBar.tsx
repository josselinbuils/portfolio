import cn from 'classnames';
import React, { FC, MouseEvent } from 'react';
import styles from './TitleBar.module.scss';
import { findClosestElement } from '~/platform/utils';

export const TitleBar: FC<Props> = ({
  background,
  color,
  frozen,
  maximized,
  onClose,
  onMaximize,
  onMinimise,
  onMoveStart,
  showMaximizeButton,
  title
}) => {
  const moveStartHandler = (downEvent: MouseEvent) => {
    const target = downEvent.target as HTMLElement;

    if (findClosestElement(target, 'button') === undefined) {
      onMoveStart(downEvent);
    }
  };

  return (
    <header
      className={cn(styles.titlebar, { [styles.maximized]: maximized })}
      style={{ background, color }}
      onMouseDown={moveStartHandler}
      onDoubleClick={() => onMaximize()}
    >
      <div className={cn(styles.buttons, { [styles.frozen]: frozen })}>
        <button
          className={cn(styles.button, styles.close)}
          onClick={() => onClose()}
        >
          <i className="fas fa-times" />
        </button>
        <button
          className={cn(styles.button, styles.minimize)}
          onClick={() => onMinimise()}
        >
          <i className="fas fa-minus" />
        </button>
        {showMaximizeButton && (
          <button
            className={cn(styles.button, styles.maximize)}
            onClick={() => onMaximize()}
          >
            <i className="fas fa-plus" />
          </button>
        )}
      </div>
      <span className={styles.title}>{title}</span>
    </header>
  );
};

interface Props {
  background: string;
  color: string;
  frozen: boolean;
  maximized: boolean;
  showMaximizeButton: boolean;
  title: string;
  onClose(): void;
  onMaximize(): void;
  onMinimise(): void;
  onMoveStart(downEvent: MouseEvent): void;
}
