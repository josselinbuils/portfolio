import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, HTMLAttributes } from 'react';

import styles from './ToolButton.module.scss';

export const ToolButton: FC<Props> = ({
  className,
  icon,
  ...forwardedProps
}) => (
  <button className={cn(styles.toolButton, className)} {...forwardedProps}>
    <FontAwesomeIcon icon={icon} />
  </button>
);

interface Props extends HTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition;
}
