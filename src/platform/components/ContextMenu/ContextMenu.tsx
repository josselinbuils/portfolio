import cn from 'classnames';
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { ROOT_FONT_SIZE_PX } from '../../constants';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';
import { ContextMenuItem } from './ContextMenuItem';

import styles from './ContextMenu.module.scss';

export const ContextMenu: FC<Props> = ({
  className,
  items,
  onHide,
  makeFirstItemActive = false,
  onActivate = () => {},
  position,
  style,
}) => {
  const defaultActiveIndex = makeFirstItemActive ? 0 : -1;
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const listElementRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const listElement = listElementRef.current;

    if (listElement === null) {
      return;
    }

    const listHeight = listElement.clientHeight;
    const itemHeight = (listElement.firstElementChild as HTMLElement)
      .clientHeight;
    const maxScrollTop = activeIndex * itemHeight;
    const minScrollTop = maxScrollTop + itemHeight - listHeight;

    if (listElement.scrollTop > maxScrollTop) {
      listElement.scrollTop = maxScrollTop;
    } else if (listElement.scrollTop < minScrollTop) {
      listElement.scrollTop = minScrollTop;
    }
  }, [activeIndex]);

  useEffect(() => onActivate(activeIndex), [activeIndex, onActivate]);

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
    >
      {items.map(({ onClick, icon, title }, index) => (
        <ContextMenuItem
          active={index === activeIndex}
          key={index}
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
