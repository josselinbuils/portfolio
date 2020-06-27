import { ClientCursor } from './ClientCursor';
import { EditableState } from './EditableState';

export interface ClientState extends EditableState {
  cursorColor: string;
  cursors: ClientCursor[];
  id: number;
}
