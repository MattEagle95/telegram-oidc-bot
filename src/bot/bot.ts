import { authSecret } from './commands/auth.commands';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { Telegraf } from 'telegraf';
import { BotCommand } from 'telegraf/typings/core/types/typegram';

import { ENV, ENV_AUTH_OIDC } from '@/env';
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
        points: 15,
        duration: 60,
        blockDuration: 5 * 60,
        dynamicBlock: {
          points: 5,
        },
      }),
    );
    this.bot.use(
      rateLimitMiddleware({
        points: (24 * 60 * 60) / 10,
        duration: 24 * 60 * 60,
        blockDuration: 60 * 60,
        dynamicBlock: {
          points: 5,
        },
      }),
    );

    const commands: (BotCommand & { fn: any })[] = [];
    if (ENV.AUTH_SECRET) {
      commands.push({
        command: 'auth_secret',
        description: 'Authenticate',
        fn: authSecret,
      });
    }
    if (ENV_AUTH_OIDC) {
      commands.push({
        command: 'auth_oidc',
        description: 'Authenticate',
        fn: authSecret,
      });
    }
    commands.push(
      {
        command: 'ping',
        description: 'Pong',
        fn: authSecret,
      },
      {
        command: 'start',
        description: 'start',
        fn: authSecret,
      },
      {
        command: 'help',
        description: 'help',
        fn: authSecret,
      },
    );

    commands.forEach((command) => {
      this.bot.command(command.command, command.fn);
    });

    this.bot.telegram.setMyCommands(commands);
  }

  listen(): void {
    this.bot.launch();
    logger.info(`bot is running`);
  }
}
