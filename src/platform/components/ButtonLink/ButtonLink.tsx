import cn from 'classnames';
import { type ButtonHTMLAttributes, type FunctionComponent } from 'preact';

import styles from './ButtonLink.module.css';

export type ButtonLinkProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export const ButtonLink: FunctionComponent<ButtonLinkProps> = ({
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
