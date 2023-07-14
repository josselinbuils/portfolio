import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import cn from 'classnames';
import { type FC } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon';
import { useToolbar } from '@/platform/hooks/useToolbar';
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
}) => {
  const { getToolProps, toolbarProps } = useToolbar();
  const { className, ...otherToolbarProps } = toolbarProps;

  return (
    <header
      className={cn(styles.titlebar, className, {
        [styles.maximized]: maximized,
      })}
      style={{ background, color }}
    >
      <div
        className={cn(styles.buttons, { [styles.frozen]: frozen })}
        {...otherToolbarProps}
      >
        <button
          className={cn(styles.button, styles.close)}
          onClick={onClose}
          style={{ color }}
          type="button"
          {...getToolProps<HTMLButtonElement>(`closeButton${title}`)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <button
          className={cn(styles.button, styles.minimize)}
          onClick={onMinimise}
          style={{ color }}
          type="button"
          {...getToolProps<HTMLButtonElement>(`minimizeButton${title}`)}
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
        {showMaximizeButton && (
          <button
            className={cn(styles.button, styles.maximize)}
            onClick={onToggleMaximize}
            style={{ color }}
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
