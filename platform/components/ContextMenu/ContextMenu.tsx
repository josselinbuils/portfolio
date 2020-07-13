import cn from 'classnames';
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { createGUID } from '~/platform/utils/createGUID';
import { ROOT_FONT_SIZE_PX } from '../../constants';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';
import { ContextMenuItem } from './ContextMenuItem';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

import styles from './ContextMenu.module.scss';

export const ContextMenu: FC<Props> = ({
  className,
  items: itemsWithoutID,
  onHide,
  makeFirstItemActive = false,
  onActivate = () => {},
  position,
  style,
}) => {
  const defaultActiveIndex = makeFirstItemActive ? 0 : -1;
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [items, setItems] = useState<
    (ContextMenuItemDescriptor & { id: string })[]
  >([]);
  const listElementRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const listElement = listElementRef.current;

    if (listElement === null || listElement.firstElementChild === null) {
      return;
    }

    const listHeight = listElement.clientHeight;
    const itemHeight = listElement.firstElementChild.clientHeight;
    const maxScrollTop = activeIndex * itemHeight;
    const minScrollTop = maxScrollTop + itemHeight - listHeight;

    if (listElement.scrollTop > maxScrollTop) {
      listElement.scrollTop = maxScrollTop;
    } else if (listElement.scrollTop < minScrollTop) {
      listElement.scrollTop = minScrollTop;
    }
  }, [activeIndex]);

  useEffect(() => onActivate(activeIndex), [activeIndex, onActivate]);

  useLayoutEffect(() => {
    setItems(itemsWithoutID.map((item) => ({ ...item, id: createGUID() })));
  }, [itemsWithoutID]);

  useKeyMap({
    ArrowDown: () =>
      setActiveIndex(activeIndex < items.length - 1 ? activeIndex + 1 : 0),
    ArrowUp: () =>
      setActiveIndex(activeIndex > 0 ? activeIndex - 1 : items.length - 1),
    Enter: () => {
      if (items[activeIndex]) {
        items[activeIndex].onClick();
      }
      onHide();
    },
  });

  if (position === undefined) {
    if (activeIndex !== defaultActiveIndex) {
      setActiveIndex(defaultActiveIndex);
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
      ref={listElementRef}
      role="menu"
    >
      {items.map(({ icon, id, onClick, title }, index) => (
        <ContextMenuItem
          active={index === activeIndex}
          key={id}
          icon={icon}
          onMouseMove={() => {
            if (activeIndex !== index) {
              setActiveIndex(index);
            }
          }}
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
