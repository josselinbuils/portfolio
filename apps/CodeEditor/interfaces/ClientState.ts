import type { ClientCursor } from './ClientCursor';
import type { EditableState } from './EditableState';

export interface ClientState extends EditableState {
  cursorColor: string;
  cursors: ClientCursor[];
  id: number;
}
