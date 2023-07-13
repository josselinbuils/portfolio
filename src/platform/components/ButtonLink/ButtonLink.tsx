import cn from 'classnames';
import { type HTMLAttributes, type FC } from 'preact/compat';
import styles from './ButtonLink.module.scss';

export interface ButtonLinkProps extends HTMLAttributes<HTMLButtonElement> {
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
