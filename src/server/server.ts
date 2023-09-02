import { HttpError } from '../errors/http.error';
import { authController } from './controllers/auth.controller';
import { pingController } from './controllers/ping.controller';
import express, { NextFunction, Request, Response } from 'express';
import http from 'http';

import { ENV } from '@/env';
import logger from '@/logger';

export class Server {
  app: express.Express = express();
  server: http.Server | undefined = undefined;

  constructor() {
    this.app.use(express.json());

    this.app.use('/ping', pingController);
    this.app.use('/auth', authController);

    this.app.use(this.errorHandler);
  }

  async listen(): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      this.app
        .listen(ENV.SERVER_PORT)
        .once('listening', (server: http.Server) => {
          logger.info(`server is running at ${ENV.SERVER_URL}`);
          this.server = server;
          resolve(server);
        })
        .once('error', reject);
    });
  }

  errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(err);

    if (err instanceof HttpError) {
      return res.status(err.statusCode).send(`${err.name}\\n${err.message}`);
    }

    res.status(500).send('InternalServerError');
  }
}
