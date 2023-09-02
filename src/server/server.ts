import { CallbackController } from './controllers/callback.controller';
import express from 'express';

import { CONFIG } from '@/config';
import logger from '@/logger';

export class Server {
  app: express.Express = express();

  constructor() {
    this.app.use(express.json());
    this.app.use('/cb', CallbackController);
  }

  async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.app
        .listen(CONFIG.server.port, () => {
          logger.info(
            `server is running at ${CONFIG.server.host}:${CONFIG.server.port}`,
          );
        })
        .once('listening', resolve)
        .once('error', reject);
      this.app
        .listen(CONFIG.server.port)
        .once('listening', resolve)
        .once('error', reject);
    });
  }
}
