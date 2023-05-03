import { Context } from 'telegraf';

export const PingCommand = async (ctx: Context): Promise<void> => {
  ctx.reply('pong');
};
