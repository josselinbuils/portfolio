import {
  Suspense,
  createPortal,
  type FC,
  type PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'preact/compat';
import { lazy } from '@/platform/utils/lazy';
import { type MenuDescriptor } from '../../components/Menu/Menu';
import { MenuContext } from './MenuContext';
import styles from './WithMenu.module.scss';

const Menu = lazy(
  async () => (await import('@/platform/components/Menu/Menu')).Menu,
);

export const WithMenu: FC<PropsWithChildren> = ({ children }) => {
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
      {children}
      {descriptor && (
        <Suspense fallback={null}>
          {createPortal(
            <>
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <div className={styles.overlay} onMouseDown={hideMenu} />
              <Menu {...descriptor} onHide={hideMenu} />
            </>,
            document.body,
          )}
        </Suspense>
      )}
    </MenuContext.Provider>
  );
};
