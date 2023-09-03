import { commandHandler } from '@/utils/utils';
import { Context } from 'telegraf';

export const pingCommand = commandHandler(
  async (ctx: Context): Promise<void> => {
  ctx.reply('pong');
});
