import { createContext } from 'react';
import { ContextMenuDescriptor } from './ContextMenu';

export const ContextMenuContext = createContext<ContextMenuDescriptorSetter>(
  () => {
    throw new Error('ContextMenuContext not initialized');
  }
);

export type ContextMenuDescriptorSetter = (
  descriptor: ContextMenuDescriptor
) => void;
