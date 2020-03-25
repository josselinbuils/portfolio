import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC } from 'react';
import styles from './Select.module.scss';

export const Select: FC<Props> = ({ children, className, onChange, value }) => (
  <div className={cn(styles.select, className)}>
    <FontAwesomeIcon className={styles.icon} icon={faArrowDown} />
    <select onChange={event => onChange(event.target.value)} value={value}>
      {children}
    </select>
  </div>
);

interface Props {
  className?: string;
  value: string;
  onChange(value: string): void;
}
