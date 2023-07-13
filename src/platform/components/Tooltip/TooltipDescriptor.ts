import { type CSSProperties, type JSX } from 'preact/compat';
import { type Position } from '@/platform/interfaces/Position';

export interface TooltipDescriptor {
  className?: string;
  position?: Position;
  style?: CSSProperties;
  title: string | JSX.Element;
}
