import { CSSProperties, ReactNode } from 'react';
import { Position } from '~/platform/interfaces/Position';

export interface TooltipDescriptor {
  className?: string;
  position?: Position;
  style?: CSSProperties;
  title: string | ReactNode;
}
