import { Request } from 'express';
import { config } from '../../../config';
import { JamendoBoost } from '../interfaces/JamendoBoost';
import { JamendoOrder } from '../interfaces/JamendoOrder';
import { JamendoTrackParameters } from '../interfaces/JamendoTrackParameters';
import { Music } from '../interfaces/Music';
import { formatTracks } from '../utils/formatTracks';
import { requestJamendoAPI } from '../utils/requestJamendoAPI';

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
