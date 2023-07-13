import { type Request, type Response } from 'express';
import { Logger } from './Logger';
import { HTTP_INTERNAL_ERROR } from './constants';

type SyncRequestHandler = (req: Request) => any;
type RequestHandler = (req: Request, res: Response) => void;

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
