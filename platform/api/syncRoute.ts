import type { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from './Logger';
import { HTTP_INTERNAL_ERROR } from './constants';

export function syncRoute(handler: SyncRequestHandler): RequestHandler {
  return (req: NextApiRequest, res: NextApiResponse) => {
    try {
      res.json(handler(req));
    } catch (error: any) {
      Logger.error(error.stack);
      res.status(HTTP_INTERNAL_ERROR).end();
    }
  };
}

type SyncRequestHandler = (req: NextApiRequest) => any;
type RequestHandler = (req: NextApiRequest, res: NextApiResponse) => void;
