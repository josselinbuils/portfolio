import classNames from 'classnames';
import React, { FC } from 'react';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';
import styles from './ContextMenuItem.module.scss';

export const ContextMenuItem: FC<ContextMenuItemDescriptor> = ({
  onClick,
  iconClass,
  title
}) => (
  <li className={styles.item} key={title} onClick={onClick}>
    <div className={styles.icon}>
      {iconClass && <i className={classNames('fas', iconClass)} />}
    </div>
    <div className={styles.title}>{title}</div>
  </li>
);
