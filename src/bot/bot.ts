import { authCommand } from './commands/auth.commands';
import { pingCommand } from './commands/ping.commands';
import { Telegraf } from 'telegraf';

import { CONFIG } from '@/config';
import logger from '@/logger';

export class Bot {
  bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(CONFIG.bot.token);
    this.bot.catch((e, ctx) => {
      logger.error('Bot error');
      logger.error(e);
      ctx.reply('Error');
    });

    this.bot.command('ping', pingCommand);
    this.bot.command('auth', authCommand);
  }

  listen(): void {
    this.bot.launch();
    logger.info(`bot is running`);
  }
}
