import { createContext } from 'preact/compat';
import { type MenuDescriptor } from '../../components/Menu/Menu';

export const MenuContext = createContext<MenuManager>({
  isMenuDisplayed: false,
  hideMenu: throwNotInitializedError,
  showMenu: throwNotInitializedError,
});

export interface MenuManager {
  isMenuDisplayed: boolean;
  hideMenu(): void;
  showMenu(descriptor: MenuDescriptor): void;
}

function throwNotInitializedError(): void {
  throw new Error('MenuContext not initialized');
}
