import classNames from 'classnames';
import React, { FC, MouseEvent } from 'react';
import styles from './ContextMenuItem.module.scss';

export const ContextMenuItem: FC<ContextMenuItemDescriptor> = ({
  onClick,
  iconClass,
  title
}) => {
  return (
    <li className={styles.item} key={title} onClick={onClick}>
      <div className={styles.icon}>
        {iconClass && <i className={classNames('fas', iconClass)} />}
      </div>
      <div className={styles.title}>{title}</div>
    </li>
  );
};

export interface ContextMenuItemDescriptor {
  iconClass?: string;
  title: string;
  onClick(event: MouseEvent): void;
}
