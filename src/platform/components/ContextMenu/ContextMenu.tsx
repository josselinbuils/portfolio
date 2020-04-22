import cn from 'classnames';
import React, { FC } from 'react';
import { ROOT_FONT_SIZE_PX } from '../../constants';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';
import { ContextMenuItem } from './ContextMenuItem';

import styles from './ContextMenu.module.scss';

export const ContextMenu: FC<Props> = ({
  className,
  items,
  onHide,
  position,
  style,
}) => {
  if (position === undefined) {
    return null;
  }
  const { x, y } = position;

  return (
    <ul
      className={cn(styles.contextMenu, className)}
      style={{
        ...style,
        left: `${x / ROOT_FONT_SIZE_PX}rem`,
        top: `${y / ROOT_FONT_SIZE_PX}rem`,
      }}
    >
      {items.map(({ onClick, icon, title }) => (
        <ContextMenuItem
          key={title}
          icon={icon}
          onClick={(event) => {
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
