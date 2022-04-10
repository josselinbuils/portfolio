import http, { ClientRequest, IncomingMessage } from 'http';
import https from 'https';
import { URL } from 'url';

const protocolClientMap: { [protocol: string]: HTTPClient } = {
  'http:': http,
  'https:': https,
};

export const httpClient = { get };

async function get(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const { protocol } = new URL(url);
    const client = protocolClientMap[protocol];

    if (client === undefined) {
      throw new Error(`No client available for protocol '${protocol}'`);
    }

    protocolClientMap[protocol]
      .get(url, (res) => {
        const contentType = res.headers['content-type'] ?? '';
        let rawData = '';

        res.on('data', (chunk) => {
          rawData += chunk;
        });

        res.on('end', () => {
          if (contentType.startsWith('application/json')) {
            resolve(JSON.parse(rawData));
          } else {
            resolve(rawData);
          }
        });
      })
      .on('error', reject);
  });
}

interface HTTPClient {
  get(url: string, callback: (res: IncomingMessage) => void): ClientRequest;
}
