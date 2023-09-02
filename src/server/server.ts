import { authController } from './controllers/auth.controller';
import { pingController } from './controllers/ping.controller';
import express from 'express';
import http from 'http';

import { CONFIG } from '@/config';
import logger from '@/logger';

export class Server {
  app: express.Express = express();
  server: http.Server | undefined = undefined;

  constructor() {
    this.app.use(express.json());

    this.app.use('/ping', pingController);
    this.app.use('/auth', authController);
  }

  async listen(): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      this.app
        .listen(CONFIG.server.port)
        .once('listening', (server: http.Server) => {
          logger.info(
            `server is running at ${CONFIG.server.host}:${CONFIG.server.port}`,
          );
          this.server = server;
          resolve(server);
        })
        .once('error', reject);
      this.app
        .listen(CONFIG.server.port)
        .once('listening', resolve)
        .once('error', reject);
    });
  }
}
