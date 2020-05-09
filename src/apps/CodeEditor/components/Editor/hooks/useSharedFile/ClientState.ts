import { EditableState } from '../../interfaces/EditableState';
import { ClientCursor } from './ClientCursor';

export interface ClientState extends EditableState {
  cursorColor: string;
  cursors: ClientCursor[];
  id: number;
}
