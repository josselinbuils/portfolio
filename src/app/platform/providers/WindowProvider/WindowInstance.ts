import { ElementType } from 'react';

export interface WindowInstance {
  active: boolean;
  component: ElementType;
  id: number;
  visible: boolean;
  zIndex: number;
}
