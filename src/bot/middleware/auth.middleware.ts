import { DI } from "@/di";
import { ENV } from "@/env";
import { BotError } from "@/errors/bot.error";
import { commandHandler } from "@/utils/utils";
import { Context } from "telegraf";

export const authMiddleware = () => {
  return commandHandler(async (ctx: Context, next: any) => {
    if (!ctx.message) {
      return;
    }

    let chat;
    try {
      chat = await DI.prisma.chat.findFirstOrThrow({
        where: {
          id: ctx.message.from.id,
        },
      });

      if(!chat.verifiedAt || (Date.now() - ENV.AUTH_SESSION_EXPIRY) > chat.verifiedAt.getTime()) {
        throw new BotError('Unauthenticated');
      }
    } catch(e) {
      throw new BotError('Unauthenticated');
    }

    next();
  }
)}