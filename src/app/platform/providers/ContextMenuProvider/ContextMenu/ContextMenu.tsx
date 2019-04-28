import React, { FC } from 'react';
import { ContextMenuItem, ContextMenuItemDescriptor } from './ContextMenuItem';
import './ContextMenu.scss';

export const ContextMenu: FC<Props> = ({ items, onHide, position, style }) => {
  if (position === undefined) {
    return null;
  }
  const { left, top } = position;

  return (
    <ul className="context-menu" style={{ ...style, left, top }}>
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

export interface ContextMenuDescriptor {
  items: ContextMenuItemDescriptor[];
  position?: { left: number; top: number };
  style?: any;
}

interface Props extends ContextMenuDescriptor {
  onHide(): void;
}
