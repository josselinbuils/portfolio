import cn from 'classnames';
import { type FC } from 'preact/compat';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/compat';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { createGUID } from '@/platform/utils/createGUID';
import { ROOT_FONT_SIZE_PX } from '../../../constants';
import { type ContextMenuDescriptor } from '../ContextMenuDescriptor';
import { type ContextMenuItemDescriptor } from '../ContextMenuItemDescriptor';
import styles from './ContextMenu.module.scss';
import { ContextMenuItem } from './ContextMenuItem';

export interface ContextMenuProps extends ContextMenuDescriptor {
  onHide(): void;
}

export const ContextMenu: FC<ContextMenuProps> = ({
  className,
  enterWithTab,
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

  function clickOnActiveItem(): void {
    if (items[activeIndex]) {
      items[activeIndex].onClick();
      onHide();
    }
  }

  useKeyMap(
    {
      ArrowDown: () =>
        setActiveIndex(activeIndex < items.length - 1 ? activeIndex + 1 : 0),
      ArrowUp: () =>
        setActiveIndex(activeIndex > 0 ? activeIndex - 1 : items.length - 1),
      Enter: clickOnActiveItem,
      Escape: onHide,
      Tab: () => {
        if (enterWithTab) {
          clickOnActiveItem();
        } else {
          return false;
        }
      },
    },
    true,
    2,
  );

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
      onMouseLeave={() => setActiveIndex(defaultActiveIndex)}
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
