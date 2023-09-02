import { AuthCommand } from './commands/auth.commands';
import { PingCommand } from './commands/ping.commands';
import { Telegraf } from 'telegraf';

import { CONFIG } from '@/config';
import logger from '@/logger';

export class Bot {
  bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(CONFIG.bot.token);
    this.bot.command('ping', PingCommand);
    this.bot.command('auth', AuthCommand);
  }

  async listen(): Promise<void> {
    this.bot.launch();
    logger.info(`bot is running as ${this.bot.botInfo?.username}`);
  }
}
