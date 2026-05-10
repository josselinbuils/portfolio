import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { type PropsWithChildren } from 'preact/compat';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import styles from './Select.module.scss';

export interface SelectProps extends PropsWithChildren {
  className?: string;
  onChange(value: string): void;
  value: string;
}

export const Select: FunctionComponent<SelectProps> = ({
  children,
  className,
  onChange,
  value,
}) => (
  <div className={cn(styles.container, className)}>
    <FontAwesomeIcon className={styles.icon} icon={faArrowDown} />
    <select
      className={styles.select}
      onChange={(event) => onChange(event.currentTarget.value)}
      value={value}
    >
      {children}
    </select>
  </div>
);
