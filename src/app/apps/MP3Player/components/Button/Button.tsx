import cn from 'classnames';
import React, { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react';
import styles from './Button.module.scss';

export const Button: FC<Props> = ({
  checked = false,
  children,
  className,
  ...forwardedProps
}) => (
  <button
    {...forwardedProps}
    className={cn(styles.button, className, { [styles.checked]: checked })}
  >
    {children}
  </button>
);

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  checked?: boolean;
  className?: string;
}
