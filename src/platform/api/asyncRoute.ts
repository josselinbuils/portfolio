import { type Request, type Response } from 'express';
import { Logger } from './Logger';
import { HTTP_INTERNAL_ERROR } from './constants';

type AsyncRequestHandler = (req: Request) => Promise<any>;
type RequestHandler = (req: Request, res: Response) => void;

export function asyncRoute(handler: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response) => {
    handler(req)
      .then(res.json.bind(res))
      .catch((error) => {
        Logger.error(error.stack);
        res.status(HTTP_INTERNAL_ERROR).end();
      });
  };
}
