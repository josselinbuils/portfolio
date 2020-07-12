/* eslint-disable camelcase */
import { JamendoBoost } from './JamendoBoost';
import { JamendoOrder } from './JamendoOrder';

export interface JamendoTrackParameters {
  boost?: JamendoBoost;
  client_id: string;
  format?: 'json' | 'jsonpretty' | 'xml';
  limit?: string;
  order?: JamendoOrder;
  tags?: string;
}
