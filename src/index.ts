import '@/env';

import logger from './logger';
import { PrismaClient } from '@prisma/client';

import { Bot } from '@/bot/bot';
import { DI } from '@/di';
import { Server } from '@/server/server';

const main = async (): Promise<void> => {
  const startTime = Date.now();
  logger.info('starting');

  DI.prisma = new PrismaClient();

  DI.server = new Server();
  await DI.server.listen();

  DI.bot = new Bot();
  DI.bot.listen();

  logger.info(`started in ${Date.now() - startTime}ms`);
};

(async () => {
  try {
    await main();
    await DI.prisma.$disconnect();
  } catch (e) {
    logger.error(e);
    await DI.prisma.$disconnect();
    process.exit(1);
  }
})();
