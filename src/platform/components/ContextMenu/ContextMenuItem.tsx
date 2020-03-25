import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

import styles from './ContextMenuItem.module.scss';

export const ContextMenuItem: FC<ContextMenuItemDescriptor> = ({
  onClick,
  icon,
  title,
}) => (
  <li className={styles.item} key={title} onClick={onClick}>
    <div className={styles.icon}>{icon && <FontAwesomeIcon icon={icon} />}</div>
    <div className={styles.title}>{title}</div>
  </li>
);
