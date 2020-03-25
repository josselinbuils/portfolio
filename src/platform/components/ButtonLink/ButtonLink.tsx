import cn from 'classnames';
import React, { ButtonHTMLAttributes, FC } from 'react';

import styles from './ButtonLink.module.scss';

export const ButtonLink: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  ...forwardedProps
}) => (
  <button {...forwardedProps} className={cn(styles.buttonLink, className)}>
    {children}
  </button>
);
