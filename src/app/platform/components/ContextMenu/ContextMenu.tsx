import React, { FC } from 'react';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';
import { ContextMenuItem } from './ContextMenuItem';
import styles from './ContextMenu.module.scss';

export const ContextMenu: FC<Props> = ({ items, onHide, position, style }) => {
  if (position === undefined) {
    return null;
  }
  const { x, y } = position;

  return (
    <ul className={styles.contextMenu} style={{ ...style, left: x, top: y }}>
      {items.map(({ onClick, iconClass, title }) => (
        <ContextMenuItem
          key={title}
          iconClass={iconClass}
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
