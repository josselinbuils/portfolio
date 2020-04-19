import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, HTMLAttributes } from 'react';

import styles from './Button.module.scss';

export const Button: FC<Props> = ({ className, icon, ...forwardedProps }) => (
  <button className={cn(styles.button, className)} {...forwardedProps}>
    <FontAwesomeIcon icon={icon} />
  </button>
);

interface Props extends HTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition;
}
