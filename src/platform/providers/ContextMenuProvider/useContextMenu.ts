import { useContext } from 'react';
import {
  ContextMenuContext,
  ContextMenuDescriptorSetter
} from './ContextMenuContext';

export function useContextMenu(): ContextMenuDescriptorSetter {
  return useContext(ContextMenuContext);
}
