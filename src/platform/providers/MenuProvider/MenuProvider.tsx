import cn from 'classnames';
import {
  type FC,
  type JSX,
  type PropsWithChildren,
  Suspense,
} from 'preact/compat';
import {
  Children,
  cloneElement,
  useCallback,
  useMemo,
  useState,
} from 'preact/compat';
import { lazy } from '@/platform/utils/lazy';
import { MenuContext } from './MenuContext';
import { type MenuDescriptor } from './MenuDescriptor';
import styles from './MenuProvider.module.scss';

const Menu = lazy(
  async () =>
    (await import('@/platform/providers/MenuProvider/Menu/Menu')).Menu,
);

export const MenuProvider: FC<PropsWithChildren> = ({ children }) => {
  const [descriptor, setDescriptor] = useState<MenuDescriptor>();
  const hideMenu = useCallback(() => setDescriptor(undefined), []);

  const value = useMemo(
    () => ({
      hideMenu,
      isMenuDisplayed: descriptor !== undefined,
      showMenu: setDescriptor,
    }),
    [descriptor, hideMenu],
  );

  return (
    <MenuContext.Provider value={value}>
      {Children.map(children as JSX.Element[], (child) =>
        cloneElement(child, {
          className: cn(child.props.className, {
            [styles.eventLess]: descriptor,
          }),
        }),
      )}
      {descriptor && (
        <Suspense fallback={null}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div className={styles.overlay} onMouseDown={hideMenu} />
          <Menu {...descriptor} onHide={hideMenu} />
        </Suspense>
      )}
    </MenuContext.Provider>
  );
};
