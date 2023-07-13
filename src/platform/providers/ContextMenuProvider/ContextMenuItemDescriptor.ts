import { type IconDefinition } from '@fortawesome/fontawesome-svg-core/';
import { type JSX } from 'preact/compat';

export interface ContextMenuItemDescriptor {
  icon?: IconDefinition;
  title: string | JSX.Element;
  onClick(): void;
}
