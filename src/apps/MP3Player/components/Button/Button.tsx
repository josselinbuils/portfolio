import cn from 'classnames';
import {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type FunctionComponent,
} from 'preact';

import styles from './Button.module.css';

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  checked?: boolean;
  className?: string;
};

export const Button: FunctionComponent<ButtonProps> = ({
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
