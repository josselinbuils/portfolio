import { type IconDefinition } from '@fortawesome/fontawesome-svg-core/';
import { type ReactNode } from 'react';

export interface ContextMenuItemDescriptor {
  icon?: IconDefinition;
  title: string | ReactNode;
  onClick(): void;
}
