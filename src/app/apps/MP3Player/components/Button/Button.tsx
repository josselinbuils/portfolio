import cn from 'classnames';
import React, { DOMAttributes, FC } from 'react';
import styles from './Button.module.scss';

export const Button: FC<Props> = ({
  children,
  className,
  ...forwardedProps
}) => (
  <button {...forwardedProps} className={cn(styles.button, className)}>
    {children}
  </button>
);

interface Props extends DOMAttributes<HTMLButtonElement> {
  className?: string;
}
