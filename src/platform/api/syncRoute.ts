import { type Request, type Response } from 'express';

import { HTTP_INTERNAL_ERROR } from './constants';
import { Logger } from './Logger';

type RequestHandler = (req: Request, res: Response) => void;
type SyncRequestHandler = (req: Request) => any;

export function syncRoute(handler: SyncRequestHandler): RequestHandler {
  return (req: Request, res: Response) => {
    try {
      res.json(handler(req));
    } catch (error: any) {
      Logger.error(error.stack);
      res.status(HTTP_INTERNAL_ERROR).end();
    }
  };
}
