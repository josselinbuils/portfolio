import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import cn from 'classnames';
import { forwardRef, type HTMLAttributes, type JSX } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { WithTooltip } from '@/platform/components/Tooltip/WithTooltip';
import styles from './ToolButton.module.scss';

export interface ToolButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'icon' | 'title'> {
  className?: string;
  icon: IconDefinition;
  title: string | JSX.Element;
}

export const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ children, className, icon, title, ...forwardedProps }, ref) => (
    <WithTooltip className={styles.tooltip} title={title}>
      <button
        className={cn(styles.toolButton, className)}
        type="button"
        {...forwardedProps}
        ref={ref}
      >
        <FontAwesomeIcon icon={icon} />
        {children}
      </button>
    </WithTooltip>
  ),
);
