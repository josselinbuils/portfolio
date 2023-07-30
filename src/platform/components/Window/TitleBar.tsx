import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import cn from 'classnames';
import { type FC } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { useToolbar } from '@/platform/hooks/useToolbar';
import styles from './TitleBar.module.scss';

export interface TitleBarProps {
  className: string | undefined;
  frozen: boolean;
  maximized: boolean;
  showMaximizeButton: boolean;
  title: string;
  onClose(): void;
  onMinimise(): void;
  onMoveStart(downEvent: MouseEvent): void;
  onToggleMaximize(): void;
}

export const TitleBar: FC<TitleBarProps> = ({
  className,
  frozen,
  maximized,
  onClose,
  onMinimise,
  onMoveStart,
  onToggleMaximize,
  showMaximizeButton,
  title,
}) => {
  const { getToolProps, toolbarProps } = useToolbar();
  const { className: toolbarClassName, ...otherToolbarProps } = toolbarProps;

  return (
    <header
      className={cn(
        styles.titleBar,
        toolbarClassName,
        { [styles.maximized]: maximized },
        className,
      )}
    >
      <div
        className={cn(styles.buttons, { [styles.frozen]: frozen })}
        {...otherToolbarProps}
      >
        <button
          aria-label="close"
          className={cn(styles.button, styles.close)}
          onClick={onClose}
          type="button"
          {...getToolProps<HTMLButtonElement>(`closeButton${title}`)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <button
          aria-label="minimize"
          className={cn(styles.button, styles.minimize)}
          onClick={onMinimise}
          type="button"
          {...getToolProps<HTMLButtonElement>(`minimizeButton${title}`)}
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
        {showMaximizeButton && (
          <button
            aria-label="maximize"
            className={cn(styles.button, styles.maximize)}
            onClick={onToggleMaximize}
            type="button"
            {...getToolProps<HTMLButtonElement>(`toggleMaximizeButton${title}`)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <h2
        className={styles.title}
        onMouseDown={onMoveStart}
        // eslint-disable-next-line react/no-unknown-property
        onDblClick={onToggleMaximize}
      >
        {title}
      </h2>
    </header>
  );
};
