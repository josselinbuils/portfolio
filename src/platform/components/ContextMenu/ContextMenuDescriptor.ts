import { CSSProperties } from 'react';
import { Position } from '~/platform/interfaces';
import { ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

export interface ContextMenuDescriptor {
  items: ContextMenuItemDescriptor[];
  position?: Position;
  style?: CSSProperties;
}
