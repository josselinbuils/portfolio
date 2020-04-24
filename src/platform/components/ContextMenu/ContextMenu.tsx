import cn from 'classnames';
import React, { FC, useState } from 'react';
import { useKeyMap } from '~/platform/hooks';
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
  const [activeIndex, setActiveIndex] = useState(-1);

  useKeyMap({
    ArrowDown: () =>
      setActiveIndex(activeIndex < items.length - 1 ? activeIndex + 1 : 0),
    ArrowUp: () =>
      setActiveIndex(activeIndex > 0 ? activeIndex - 1 : items.length - 1),
    Enter: () => {
      items[activeIndex]?.onClick();
      onHide();
    },
  });

  if (position === undefined) {
    if (activeIndex !== -1) {
      setActiveIndex(-1);
    }
    return null;
  }
  const { x, y } = position;

  return (
    <ul
      className={cn(styles.contextMenu, className)}
      style={{
        ...style,
        left: typeof x === 'string' ? x : `${x / ROOT_FONT_SIZE_PX}rem`,
        top: typeof y === 'string' ? y : `${y / ROOT_FONT_SIZE_PX}rem`,
      }}
    >
      {items.map(({ onClick, icon, title }, index) => (
        <ContextMenuItem
          active={index === activeIndex}
          key={title}
          icon={icon}
          onClick={() => {
            onClick();
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
