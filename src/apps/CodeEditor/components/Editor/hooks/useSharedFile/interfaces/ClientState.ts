import { EditableState } from '../../../interfaces/EditableState';
import { ClientCursor } from './ClientCursor';

export interface ClientState extends EditableState {
  clientID: number;
  cursorColor: string;
  cursors: ClientCursor[];
}
