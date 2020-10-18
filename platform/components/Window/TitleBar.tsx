import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { FC, MouseEvent } from 'react';

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
  title,
}) => (
  <header
    className={cn(styles.titlebar, { [styles.maximized]: maximized })}
    style={{ background, color }}
  >
    <div
      className={cn(styles.buttons, { [styles.frozen]: frozen })}
      role="toolbar"
    >
      <button
        className={cn(styles.button, styles.close)}
        onClick={onClose}
        style={{ color }}
        type="button"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <button
        className={cn(styles.button, styles.minimize)}
        onClick={onMinimise}
        style={{ color }}
        type="button"
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      {showMaximizeButton && (
        <button
          className={cn(styles.button, styles.maximize)}
          onClick={onToggleMaximize}
          style={{ color }}
          type="button"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}
    </div>
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
    <h2
      className={styles.title}
      onMouseDown={onMoveStart}
      onDoubleClick={onToggleMaximize}
    >
      {title}
    </h2>
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
