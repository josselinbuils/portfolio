import { type Request } from 'express';
import { config } from '@/platform/api/config';
import { type Music } from '../interfaces/Music';
import { type JamendoBoost } from './interfaces/JamendoBoost';
import { type JamendoOrder } from './interfaces/JamendoOrder';
import { type JamendoTrackParameters } from './interfaces/JamendoTrackParameters';
import { formatTracks } from './utils/formatTracks';
import { requestJamendoAPI } from './utils/requestJamendoAPI';

export async function getTracks(req: Request): Promise<Music[]> {
  const { order, tag } = req.query;

  const jamendoParameters: JamendoTrackParameters = {
    client_id: config.jamendo.clientId,
    format: 'json',
    imagesize: 65,
    limit: '50',
  };

  if (tag) {
    jamendoParameters.tags = tag as string;
    jamendoParameters.boost = order as JamendoBoost;
  } else {
    jamendoParameters.order = order as JamendoOrder;
  }

  return formatTracks(await requestJamendoAPI('/tracks', jamendoParameters));
}
