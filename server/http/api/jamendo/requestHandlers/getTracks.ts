import { Request } from 'express';
import { config } from '../../../config';
import {
  JamendoBoost,
  JamendoOrder,
  JamendoTrackParameters,
  Music,
} from '../interfaces';
import { formatTracks, requestJamendoAPI } from '../utils';

export async function getTracks(req: Request): Promise<Music[]> {
  const { order, tag } = req.params;

  const jamendoParameters = {
    client_id: config.jamendo.clientId,
    format: 'json',
    limit: '50',
  } as JamendoTrackParameters;

  if (tag) {
    jamendoParameters.tags = tag;
    jamendoParameters.boost = order as JamendoBoost;
  } else {
    jamendoParameters.order = order as JamendoOrder;
  }

  return formatTracks(await requestJamendoAPI('/tracks', jamendoParameters));
}
