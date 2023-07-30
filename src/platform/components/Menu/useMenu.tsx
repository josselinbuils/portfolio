import {
  Suspense,
  createPortal,
  type JSX,
  useCallback,
  useState,
} from 'preact/compat';
import { lazy } from '@/platform/utils/lazy';
import { CursorDelayedLoader } from '../CursorDelayedLoader/CursorDelayedLoader';
import { type MenuDescriptor } from './Menu';
import { type MenuItemDescriptor } from './components/MenuItem/MenuItem';

export { type MenuDescriptor, type MenuItemDescriptor };

export interface MenuManager {
  menuDescriptor: MenuDescriptor | undefined;
  isMenuDisplayed: boolean;
  hideMenu(): void;
  menuElement: JSX.Element | null;
  showMenu(descriptor: MenuDescriptor): void;
}

const Menu = lazy(async () => (await import('./Menu')).Menu);

export function useMenu(): MenuManager {
  const [menuDescriptor, setMenuDescriptor] = useState<MenuDescriptor>();
  const hideMenu = useCallback(() => setMenuDescriptor(undefined), []);

  const menuElement = menuDescriptor ? (
    <Suspense fallback={<CursorDelayedLoader />}>
      {createPortal(
        <Menu {...menuDescriptor} onHide={hideMenu} />,
        document.body,
      )}
    </Suspense>
  ) : null;

  return {
    hideMenu,
    isMenuDisplayed: menuDescriptor !== undefined,
    menuDescriptor,
    menuElement,
    showMenu: setMenuDescriptor,
  };
}
