import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { MouseEvent } from 'react';

export interface ContextMenuItemDescriptor {
  icon?: IconDefinition;
  title: string;
  onClick(event: MouseEvent): void;
}
