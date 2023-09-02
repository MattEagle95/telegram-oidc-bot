import { DI } from "@/di";
import { ENV } from "@/env";
import { BotError } from "@/errors/bot.error";
import logger from "@/logger";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { Context } from "telegraf";

interface IRateLimiterOptions {
  keyPrefix?: string;
  points?: number;
  duration?: number;
  execEvenly?: boolean;
  execEvenlyMinDelayMs?: number;
  blockDuration?: number;
}

export const authMiddleware = async (ctx: Context, next: any) => {
    if (!ctx.chat) {
        return;
    }

    let chat;
    try {
      chat = await DI.prisma.chat.findFirstOrThrow({
        where: {
          id: ctx.chat.id,
        },
      });

      if(!chat.verifiedAt || (Date.now() + ENV.AUTH_SESSION_EXPIRY) > chat.verifiedAt.getTime()) {
        throw new BotError('Unauthenticated');
      }
    } catch(e) {
      throw new BotError('Unauthenticated');
    }
  }