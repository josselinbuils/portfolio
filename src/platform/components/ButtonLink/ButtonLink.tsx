import cn from 'classnames';
import { type ButtonHTMLAttributes } from 'preact';
import { type FC } from 'preact/compat';

import styles from './ButtonLink.module.scss';

export interface ButtonLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const ButtonLink: FC<ButtonLinkProps> = ({
  children,
  className,
  ...forwardedProps
}) => (
  <button
    className={cn(styles.buttonLink, className)}
    type="button"
    {...forwardedProps}
  >
    {children}
  </button>
);
