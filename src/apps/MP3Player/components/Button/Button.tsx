import cn from 'classnames';
import { type ButtonHTMLAttributes, type DetailedHTMLProps } from 'preact';
import { type FC } from 'preact/compat';

import styles from './Button.module.scss';

export interface ButtonProps extends DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  checked?: boolean;
  className?: string;
}

export const Button: FC<ButtonProps> = ({
  checked = false,
  children,
  className,
  ...forwardedProps
}) => (
  <button
    className={cn(styles.button, className, { [styles.checked]: checked })}
    type="button"
    {...forwardedProps}
  >
    {children}
  </button>
);
