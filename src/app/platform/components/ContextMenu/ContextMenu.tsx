import React, { FC } from 'react';
import styles from './ContextMenu.module.scss';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';
import { ContextMenuItem } from './ContextMenuItem';

export const ContextMenu: FC<Props> = ({ items, onHide, position, style }) => {
  if (position === undefined) {
    return null;
  }
  const { x, y } = position;

  return (
    <ul className={styles.contextMenu} style={{ ...style, left: x, top: y }}>
      {items.map(({ onClick, icon, title }) => (
        <ContextMenuItem
          key={title}
          icon={icon}
          onClick={event => {
            onClick(event);
            onHide();
          }}
          title={title}
        />
      ))}
    </ul>
  );
};

interface Props extends ContextMenuDescriptor {
  onHide(): void;
}
