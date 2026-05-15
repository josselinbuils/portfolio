import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { useToolbar } from '@/platform/hooks/useToolbar';

import classes from './TitleBar.module.css';

export type TitleBarProps = {
  className: string | undefined;
  frozen: boolean;
  maximized: boolean;
  onClose(): void;
  onMinimise(): void;
  onMoveStart(downEvent: MouseEvent): void;
  onToggleMaximize(): void;
  showMaximizeButton: boolean;
  title: string;
};

export const TitleBar: FunctionComponent<TitleBarProps> = ({
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
        classes.titleBar,
        toolbarClassName,
        { [classes.maximized]: maximized },
        className,
      )}
    >
      <div
        className={cn(classes.buttons, { [classes.frozen]: frozen })}
        {...otherToolbarProps}
      >
        <button
          aria-label="close"
          className={cn(classes.button, classes.close)}
          onClick={onClose}
          type="button"
          {...getToolProps<HTMLButtonElement>(`closeButton${title}`)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <button
          aria-label="minimize"
          className={cn(classes.button, classes.minimize)}
          onClick={onMinimise}
          type="button"
          {...getToolProps<HTMLButtonElement>(`minimizeButton${title}`)}
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
        {showMaximizeButton && (
          <button
            aria-label="maximize"
            className={cn(classes.button, classes.maximize)}
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
        className={classes.title}
        // eslint-disable-next-line react/no-unknown-property
        onDblClick={onToggleMaximize}
        onMouseDown={onMoveStart}
      >
        {title}
      </h2>
    </header>
  );
};
