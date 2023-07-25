import cn from 'classnames';
import {
  type CSSProperties,
  type FC,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'preact/compat';
import { ROOT_FONT_SIZE_PX } from '../../constants';
import { useKeyMap } from '../../hooks/useKeyMap';
import type { Position } from '../../interfaces/Position';
import { createGUID } from '../../utils/createGUID';
import styles from './Menu.module.scss';
import {
  MenuItem,
  type MenuItemDescriptor,
} from './components/MenuItem/MenuItem';
import { MenuOverlay } from './components/MenuOverlay/MenuOverlay';

export { type MenuItemDescriptor };

export interface MenuDescriptor {
  className?: string;
  enterWithTab?: boolean;
  items: MenuItemDescriptor[];
  makeFirstItemActive?: boolean;
  onActivate?(index: number): void;
  position?: Position;
  style?: CSSProperties;
}

export interface MenuProps extends MenuDescriptor {
  onHide(): void;
}

export const Menu: FC<MenuProps> = ({
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
  const [items, setItems] = useState<(MenuItemDescriptor & { id: string })[]>(
    [],
  );
  const listElementRef = useRef<HTMLUListElement>(null);

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

  function updateActiveIndexWithKeyboard(newIndex: number) {
    setActiveIndex(newIndex);

    const listElement = listElementRef.current;

    if (listElement === null || listElement.firstElementChild === null) {
      return;
    }

    const listHeight = listElement.clientHeight;
    const itemHeight = listElement.firstElementChild.clientHeight;
    const maxScrollTop = newIndex * itemHeight;
    const minScrollTop = maxScrollTop + itemHeight - listHeight;

    if (listElement.scrollTop > maxScrollTop) {
      listElement.scrollTop = maxScrollTop;
    } else if (listElement.scrollTop < minScrollTop) {
      listElement.scrollTop = minScrollTop;
    }
  }

  useKeyMap(
    {
      ArrowDown: () =>
        updateActiveIndexWithKeyboard(
          activeIndex < items.length - 1 ? activeIndex + 1 : 0,
        ),
      ArrowUp: () =>
        updateActiveIndexWithKeyboard(
          activeIndex > 0 ? activeIndex - 1 : items.length - 1,
        ),
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
    <>
      <ul
        className={cn(styles.contextMenu, className)}
        onMouseLeave={() => setActiveIndex(items.length === 1 ? 0 : -1)}
        style={{
          ...style,
          left: typeof x === 'string' ? x : `${x / ROOT_FONT_SIZE_PX}rem`,
          top: typeof y === 'string' ? y : `${y / ROOT_FONT_SIZE_PX}rem`,
        }}
        ref={listElementRef}
        role="menu"
      >
        {items.map(({ id, onClick, title }, index) => (
          <MenuItem
            active={index === activeIndex}
            key={id}
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
      <MenuOverlay hideMenu={onHide} />
    </>
  );
};
