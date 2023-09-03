import { authOIDCCommand, authSecretCommand } from './commands/auth.commands';
import { pingCommand } from './commands/ping.commands';
import { authMiddleware } from './middleware/auth.middleware';
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

    const commands: BotCommand[] = [];
    if (ENV.AUTH_SECRET) {
      commands.push({
        command: 'auth_secret',
        description: 'Authenticate',
      });
    }
    if (ENV_AUTH_OIDC) {
      commands.push({
        command: 'auth_oidc',
        description: 'Authenticate',
      });
    }
    commands.push(
      {
        command: 'ping',
        description: 'Pong',
      },
      {
        command: 'start',
        description: 'start',
      },
      {
        command: 'help',
        description: 'help',
      },
    );

    this.bot.telegram.setMyCommands(commands);

    this.bot.command('auth_secret', authSecretCommand);
    this.bot.command('auth_oidc', authOIDCCommand);
    this.bot.command('ping', pingCommand);
    this.bot.command('start', authSecretCommand);
    this.bot.command('help', authSecretCommand);
  }

  listen(): void {
    this.bot.launch();
    logger.info(`bot is running`);
  }
}
