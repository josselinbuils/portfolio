import { useContext } from 'preact/compat';
import { type ContextMenuManager } from './ContextMenuContext';
import { ContextMenuContext } from './ContextMenuContext';

export function useContextMenu(): ContextMenuManager {
  return useContext(ContextMenuContext);
}
