import { type CSSProperties } from 'preact/compat';
import { type Position } from '@/platform/interfaces/Position';
import { type ContextMenuItemDescriptor } from './ContextMenuItemDescriptor';

export interface ContextMenuDescriptor {
  className?: string;
  enterWithTab?: boolean;
  items: ContextMenuItemDescriptor[];
  makeFirstItemActive?: boolean;
  onActivate?(index: number): void;
  position?: Position;
  style?: CSSProperties;
}
