import cn from 'classnames';
import type { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react';
import styles from './Button.module.scss';

export const Button: FC<Props> = ({
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

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  checked?: boolean;
}
