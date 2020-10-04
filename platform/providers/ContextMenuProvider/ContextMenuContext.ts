import { createContext } from 'react';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';

export const ContextMenuContext = createContext<ContextMenuManager>({
  isContextMenuDisplayed: false,
  hideContextMenu: throwNotInitializedError,
  showContextMenu: throwNotInitializedError,
});

export interface ContextMenuManager {
  isContextMenuDisplayed: boolean;
  hideContextMenu(): void;
  showContextMenu(descriptor: ContextMenuDescriptor): void;
}

function throwNotInitializedError(): void {
  throw new Error('ContextMenuContext not initialized');
}
