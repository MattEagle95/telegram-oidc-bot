import { authCommand } from './commands/auth.commands';
import { pingCommand } from './commands/ping.commands';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { Telegraf } from 'telegraf';

import { ENV } from '@/env';
import { BotError } from '@/errors/bot.error';
import logger from '@/logger';

export class Bot {
  bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(ENV.BOT_TOKEN);
    this.bot.catch((e, ctx) => {
      logger.error('bot error');
      logger.error(e);

      if (e instanceof BotError) {
        ctx.reply(`Error: ${e.message}`);
        return;
      }

      ctx.reply('Error');
    });

    this.bot.use(
      rateLimitMiddleware({
        points: 30,
        duration: 60,
        blockDuration: 15 * 60,
        dynamicBlock: {},
      }),
    );
    this.bot.use(
      rateLimitMiddleware({
        points: (24 * 60 * 60) / 10,
        duration: 24 * 60 * 60,
        blockDuration: 60 * 60,
        dynamicBlock: {},
      }),
    );

    this.bot.command('ping', pingCommand);
    this.bot.command('auth', authCommand);
  }

  listen(): void {
    this.bot.launch();
    logger.info(`bot is running`);
  }
}
