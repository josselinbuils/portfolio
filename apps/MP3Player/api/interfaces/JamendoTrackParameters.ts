/* eslint-disable camelcase */
import { type JamendoBoost } from './JamendoBoost';
import { type JamendoOrder } from './JamendoOrder';

export interface JamendoTrackParameters {
  boost?: JamendoBoost;
  client_id: string;
  format?: 'json' | 'jsonpretty' | 'xml';
  imagesize:
    | 25
    | 35
    | 50
    | 55
    | 60
    | 65
    | 70
    | 75
    | 85
    | 100
    | 130
    | 150
    | 200
    | 300
    | 400
    | 500
    | 600;
  limit?: string;
  order?: JamendoOrder;
  tags?: string;
}
