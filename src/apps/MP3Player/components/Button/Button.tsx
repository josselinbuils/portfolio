import cn from 'classnames';
import {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type FunctionComponent,
} from 'preact';

import classes from './Button.module.css';

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
    className={cn(classes.button, className, { [classes.checked]: checked })}
    type="button"
    {...forwardedProps}
  >
    {children}
  </button>
);
