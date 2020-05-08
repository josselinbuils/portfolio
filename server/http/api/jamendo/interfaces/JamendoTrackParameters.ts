import { JamendoBoost } from './JamendoBoost';
import { JamendoOrder } from './JamendoOrder';
import { JamendoParameters } from './JamendoParameters';

export interface JamendoTrackParameters extends JamendoParameters {
  boost?: JamendoBoost;
  client_id: string;
  format?: 'json' | 'jsonpretty' | 'xml';
  limit?: string;
  order?: JamendoOrder;
  tags?: string;
}
