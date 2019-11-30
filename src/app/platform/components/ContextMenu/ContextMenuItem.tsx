import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import styles from './ContextMenuItem.module.scss';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

export const ContextMenuItem: FC<ContextMenuItemDescriptor> = ({
  onClick,
  icon,
  title
}) => (
  <li className={styles.item} key={title} onClick={onClick}>
    <div className={styles.icon}>{icon && <FontAwesomeIcon icon={icon} />}</div>
    <div className={styles.title}>{title}</div>
  </li>
);
