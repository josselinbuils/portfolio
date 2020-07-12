/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

import styles from './ContextMenuItem.module.scss';

export const ContextMenuItem: FC<Props> = ({
  active,
  onClick,
  onMouseMove,
  icon,
  title,
}) => (
  // TODO use button instead
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  <li
    aria-current={active}
    className={styles.item}
    onClick={onClick}
    onMouseMove={onMouseMove}
    role="button"
    tabIndex={0}
  >
    <div className={styles.icon}>{icon && <FontAwesomeIcon icon={icon} />}</div>
    <div className={styles.title}>{title}</div>
  </li>
);

interface Props extends ContextMenuItemDescriptor {
  active: boolean;
  onMouseMove(): void;
}
