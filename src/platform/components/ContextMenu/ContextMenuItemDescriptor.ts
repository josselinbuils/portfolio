import { IconDefinition } from '@fortawesome/fontawesome-svg-core/';
import { ReactNode } from 'react';

export interface ContextMenuItemDescriptor {
  icon?: IconDefinition;
  title: string | ReactNode;
  onClick(): void;
}
