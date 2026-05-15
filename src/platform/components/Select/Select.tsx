import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { type PropsWithChildren } from 'preact/compat';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import classes from './Select.module.css';

export type SelectProps = PropsWithChildren & {
  className?: string;
  onChange(value: string): void;
  value: string;
};

export const Select: FunctionComponent<SelectProps> = ({
  children,
  className,
  onChange,
  value,
}) => (
  <div className={cn(classes.container, className)}>
    <FontAwesomeIcon className={classes.icon} icon={faArrowDown} />
    <select
      className={classes.select}
      onChange={(event) => onChange(event.currentTarget.value)}
      value={value}
    >
      {children}
    </select>
  </div>
);
