import { CSSProperties } from 'react';
import { Position } from '~/platform/interfaces/Position';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

export interface ContextMenuDescriptor {
  className?: string;
  items: ContextMenuItemDescriptor[];
  makeFirstItemActive?: boolean;
  position?: Position;
  style?: CSSProperties;
  onActivate?(index: number): void;
}
