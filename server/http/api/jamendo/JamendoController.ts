import { Request } from 'express';
import request from 'request-promise-native';
import { Logger } from '../../../Logger';
import { jamendo } from '../../config';

export class JamendoController {
  static async getTracks(req: Request): Promise<any[]> {
    const { order, tag } = req.params;

    const options: Options = {
      client_id: jamendo.clientId,
      format: 'json',
      limit: 50,
    };

    if (tag) {
      options.tags = tag;
      options.boost = order;
    } else {
      options.order = order;
    }

    return get('/tracks', options);
  }

  static init(): void {
    if (!jamendo || !jamendo.clientId) {
      throw Error('Invalid configuration: jamendo');
    }
  }
}

async function get(path: string, options: Options): Promise<any[]> {
  const queryParams = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const url = `https://api.jamendo.com/v3.0${path}/?${queryParams}`;

  Logger.info(`-> GET ${url}`);

  const { headers, results } = await request({
    json: true,
    url,
  }).promise();

  if (headers.status === 'success') {
    return results;
  } else {
    const { code, error_message } = headers;
    throw new Error(`Jamendo API error: code ${code}: ${error_message}`);
  }
}

interface Options {
  boost?: string;
  client_id: string;
  format: 'json';
  limit: number;
  order?: string;
  tags?: string;
}
