import { EditableState } from '../../interfaces';

export interface ClientState extends EditableState {
  clientID: number;
  cursorColor: string;
}
