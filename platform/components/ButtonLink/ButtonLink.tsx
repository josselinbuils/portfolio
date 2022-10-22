import cn from 'classnames';
import type { ButtonHTMLAttributes, FC } from 'react';
import styles from './ButtonLink.module.scss';

export const ButtonLink: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
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
