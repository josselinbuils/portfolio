import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import cn from 'classnames';
import { type FC, type HTMLAttributes, type JSX } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon';
import { WithTooltip } from '@/platform/providers/TooltipProvider/WithTooltip';
import styles from './ToolButton.module.scss';

export interface ToolButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'icon' | 'title'> {
  className?: string;
  icon: IconDefinition;
  title: string | JSX.Element;
}

export const ToolButton: FC<ToolButtonProps> = ({
  className,
  icon,
  title,
  ...forwardedProps
}) => (
  <WithTooltip className={styles.tooltip} title={title}>
    <button
      className={cn(styles.toolButton, className)}
      type="button"
      {...forwardedProps}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  </WithTooltip>
);
