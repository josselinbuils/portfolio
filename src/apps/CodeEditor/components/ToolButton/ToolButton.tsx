import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, HTMLAttributes, ReactNode } from 'react';
import { WithTooltip } from '~/platform/providers/TooltipProvider';

import styles from './ToolButton.module.scss';

export const ToolButton: FC<Props> = ({
  className,
  icon,
  title,
  ...forwardedProps
}) => (
  <WithTooltip className={styles.tooltip} title={title}>
    <button className={cn(styles.toolButton, className)} {...forwardedProps}>
      <FontAwesomeIcon icon={icon} />
    </button>
  </WithTooltip>
);

interface Props extends Omit<HTMLAttributes<HTMLButtonElement>, 'title'> {
  icon: IconDefinition;
  title: string | ReactNode;
}
