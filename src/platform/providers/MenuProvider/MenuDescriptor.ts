import { type CSSProperties } from 'preact/compat';
import { type Position } from '@/platform/interfaces/Position';
import { type MenuItemDescriptor } from './MenuItemDescriptor';

export interface MenuDescriptor {
  className?: string;
  enterWithTab?: boolean;
  items: MenuItemDescriptor[];
  makeFirstItemActive?: boolean;
  onActivate?(index: number): void;
  position?: Position;
  style?: CSSProperties;
}
