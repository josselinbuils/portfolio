import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { type ButtonHTMLAttributes, type FC, type ReactNode } from 'react';
import { WithTooltip } from '~/platform/providers/TooltipProvider/WithTooltip';
import styles from './ToolButton.module.scss';

export const ToolButton: FC<Props> = ({
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

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  icon: IconDefinition;
  title: string | ReactNode;
}
