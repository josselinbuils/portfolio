import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

import styles from './ContextMenuItem.module.scss';

export const ContextMenuItem: FC<Props> = ({
  active,
  onClick,
  onMouseEnter,
  icon,
  title,
}) => (
  <li
    aria-current={active}
    className={styles.item}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
  >
    <div className={styles.icon}>{icon && <FontAwesomeIcon icon={icon} />}</div>
    <div className={styles.title}>{title}</div>
  </li>
);

interface Props extends ContextMenuItemDescriptor {
  active: boolean;
  onMouseEnter(): void;
}
