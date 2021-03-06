import { NextApiRequest, NextApiResponse } from 'next';
import { HTTP_INTERNAL_ERROR } from './constants';
import { Logger } from './Logger';

export function asyncRoute(handler: AsyncRequestHandler): RequestHandler {
  return (req: NextApiRequest, res: NextApiResponse) => {
    handler(req)
      .then(res.json.bind(res))
      .catch((error) => {
        Logger.error(error.stack);
        res.status(HTTP_INTERNAL_ERROR).end();
      });
  };
}

type AsyncRequestHandler = (req: NextApiRequest) => Promise<any>;
type RequestHandler = (req: NextApiRequest, res: NextApiResponse) => void;
