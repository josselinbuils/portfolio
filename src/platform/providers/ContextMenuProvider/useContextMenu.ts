import { useContext } from 'react';
import { ContextMenuContext, ContextMenuManager } from './ContextMenuContext';

export function useContextMenu(): ContextMenuManager {
  return useContext(ContextMenuContext);
}
