import { Logger } from '@/platform/api/Logger';
import { type JamendoResponse } from '../interfaces/JamendoResponse';
import { type JamendoTrackParameters } from '../interfaces/JamendoTrackParameters';
import { httpClient } from './httpClient';

export async function requestJamendoAPI<T>(
  path: string,
  jamendoParameters: JamendoTrackParameters,
): Promise<T[]> {
  const queryParams = Object.entries(jamendoParameters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const url = `https://api.jamendo.com/v3.0${path}/?${queryParams}`;

  Logger.info(`-> GET ${url}`);

  const { headers, results } = (await httpClient.get(
    url,
  )) as JamendoResponse<T>;

  if (headers.status === 'success') {
    return results;
  }
  const { code, error_message: errorMessage } = headers;
  throw new Error(`Jamendo API error: code ${code}: ${errorMessage}`);
}
