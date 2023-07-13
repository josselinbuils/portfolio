import cn from 'classnames';
import {
  type DetailedHTMLProps,
  type FC,
  type HTMLAttributes,
} from 'preact/compat';
import styles from './Button.module.scss';

export interface ButtonProps
  extends DetailedHTMLProps<
    HTMLAttributes<HTMLButtonElement>,
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
