import { CSSProperties, ReactNode } from 'react';
import { Position } from '~/platform/interfaces';

export interface TooltipDescriptor {
  className?: string;
  id?: string;
  position?: Position;
  style?: CSSProperties;
  title: string | ReactNode;
}
