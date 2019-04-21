import { ContextMenuItem } from './ContextMenuItem';

export interface ContextMenuDescriptor {
  items: ContextMenuItem[];
  position: { left: number; top: number };
  style?: any;
}
