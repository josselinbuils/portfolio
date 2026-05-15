import { type JSX } from 'preact';
import { createPortal, Suspense } from 'preact/compat';
import { useCallback, useState } from 'preact/hooks';

import { lazy } from '@/platform/utils/lazy';

import { CursorDelayedLoader } from '../CursorDelayedLoader/CursorDelayedLoader';
import { type MenuItemDescriptor } from './components/MenuItem/MenuItem';
import { type MenuDescriptor } from './Menu';

export { type MenuDescriptor, type MenuItemDescriptor };

export type MenuManager = {
  hideMenu(): void;
  isMenuDisplayed: boolean;
  menuDescriptor: MenuDescriptor | undefined;
  menuElement: JSX.Element | null;
  showMenu(descriptor: MenuDescriptor): void;
};

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
