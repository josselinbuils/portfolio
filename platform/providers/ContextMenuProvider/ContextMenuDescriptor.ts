import type { CSSProperties } from 'react';
import type { Position } from '~/platform/interfaces/Position';
import type { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

export interface ContextMenuDescriptor {
  className?: string;
  items: ContextMenuItemDescriptor[];
  makeFirstItemActive?: boolean;
  position?: Position;
  style?: CSSProperties;
  onActivate?(index: number): void;
}
