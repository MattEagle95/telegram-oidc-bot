// prettier-ignore
import { CONFIG } from './config';

import { AuthCommand } from './commands/auth-command';
import { PingCommand } from './commands/ping';
import { DI, initializeDI } from './di';
import express from 'express';
import { Telegraf } from 'telegraf';

import { CallbackController } from '@/controllers/callback-controller';

const startServer = async (): Promise<void> => {
  const app = express();

  app.use(express.json());
  app.use('/cb', CallbackController);

  app.listen(CONFIG.server.port, () => {
    console.log(`⚡️ server is running at ${CONFIG.server.url}`);
  });
};

const startBot = async (): Promise<void> => {
  DI.bot = new Telegraf(CONFIG.bot.token);
  DI.bot.command('ping', PingCommand);
  DI.bot.command('auth', AuthCommand);
  await DI.bot.launch();
  console.log(`⚡️ ${DI.bot.botInfo?.username} is running`);
};

const main = async (): Promise<void> => {
  await initializeDI();
  await startServer();
  await startBot();
  console.log(`⚡️ running`);
};

(async () => {
  try {
    await main();
    await DI.prisma.$disconnect();
  } catch (e) {
    console.error(e);
    await DI.prisma.$disconnect();
    process.exit(1);
  }
})();
