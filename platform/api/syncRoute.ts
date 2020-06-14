import { NextApiRequest, NextApiResponse } from 'next';
import { HTTP_INTERNAL_ERROR } from './constants';
import { Logger } from './Logger';

export function syncRoute(handler: SyncRequestHandler): RequestHandler {
  return (req: NextApiRequest, res: NextApiResponse) => {
    try {
      res.json(handler(req));
    } catch (error) {
      Logger.error(error.stack);
      res.status(HTTP_INTERNAL_ERROR).end();
    }
  };
}

type SyncRequestHandler = (req: NextApiRequest) => any;
type RequestHandler = (req: NextApiRequest, res: NextApiResponse) => void;
