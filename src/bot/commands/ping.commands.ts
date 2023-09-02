import { Context } from 'telegraf';

export const pingCommand = async (ctx: Context): Promise<void> => {
  ctx.reply('pong');
};
