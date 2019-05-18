import cn from 'classnames';
import React, { FC, MouseEvent } from 'react';
import styles from './TitleBar.module.scss';

export const TitleBar: FC<Props> = ({
  background,
  color,
  frozen,
  maximized,
  onClose,
  onMinimise,
  onMoveStart,
  onToggleMaximize,
  showMaximizeButton,
  title
}) => (
  <header
    className={cn(styles.titlebar, { [styles.maximized]: maximized })}
    style={{ background, color }}
  >
    <div className={cn(styles.buttons, { [styles.frozen]: frozen })}>
      <button
        className={cn(styles.button, styles.close)}
        onClick={() => onClose()}
        style={{ color }}
      >
        <i className="fas fa-times" />
      </button>
      <button
        className={cn(styles.button, styles.minimize)}
        onClick={() => onMinimise()}
        style={{ color }}
      >
        <i className="fas fa-minus" />
      </button>
      {showMaximizeButton && (
        <button
          className={cn(styles.button, styles.maximize)}
          onClick={() => onToggleMaximize()}
          style={{ color }}
        >
          <i className="fas fa-plus" />
        </button>
      )}
    </div>
    <div onMouseDown={onMoveStart} onDoubleClick={() => onToggleMaximize()}>
      <span className={styles.title}>{title}</span>
    </div>
  </header>
);

interface Props {
  background?: string;
  color: string;
  frozen: boolean;
  maximized: boolean;
  showMaximizeButton: boolean;
  title: string;
  onClose(): void;
  onMinimise(): void;
  onMoveStart(downEvent: MouseEvent): void;
  onToggleMaximize(): void;
}
