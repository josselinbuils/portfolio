import { IconDefinition } from '@fortawesome/fontawesome-svg-core/';

export interface ContextMenuItemDescriptor {
  icon?: IconDefinition;
  title: string;
  onClick(): void;
}
