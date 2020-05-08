import { Logger } from '../../../../Logger';
import { JamendoParameters, JamendoResponse } from '../interfaces';
import { httpClient } from './httpClient';

export async function requestJamendoAPI<T>(
  path: string,
  jamendoParameters: JamendoParameters
): Promise<T[]> {
  const queryParams = Object.entries(jamendoParameters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const url = `https://api.jamendo.com/v3.0${path}/?${queryParams}`;

  Logger.info(`-> GET ${url}`);

  const { headers, results } = (await httpClient.get(url)) as JamendoResponse<
    T
  >;

  if (headers.status === 'success') {
    return results;
  } else {
    const { code, error_message } = headers;
    throw new Error(`Jamendo API error: code ${code}: ${error_message}`);
  }
}
