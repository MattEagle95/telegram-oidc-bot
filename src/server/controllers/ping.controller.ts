import { Request, Response, Router } from 'express';

import { routeHandler } from '@/utils/utils';

const router = Router();

router.get(
  '/',
  routeHandler(async (req: Request, res: Response) => {
    res.status(200).send('pong');
  }),
);

export { router as pingController };
