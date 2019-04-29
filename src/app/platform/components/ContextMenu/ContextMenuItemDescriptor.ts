import { MouseEvent } from 'react';

export interface ContextMenuItemDescriptor {
  iconClass?: string;
  title: string;
  onClick(event: MouseEvent): void;
}
