import { BotError } from "@/errors/bot.error";
import logger from "@/logger";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { Context } from "telegraf";

interface IRateLimiterOptions {
  keyPrefix?: string;
  points?: number;
  duration?: number;
  execEvenly?: boolean;
  execEvenlyMinDelayMs?: number;
  blockDuration?: number;
  dynamicBlock?: {
    points?: IRateLimiterOptions['points']
  },
}

export const rateLimitMiddleware = (options: IRateLimiterOptions) => {
  const rateLimiter = new RateLimiterMemory(options);
  const dynamicBlockRateLimiter = new RateLimiterMemory({
    points: options.dynamicBlock?.points || 5,
    duration: 0,
  });

  return async (ctx: Context, next: any) => {
    if (!ctx.chat) {
        throw new BotError('Chat required');
    }

      try {
        const entity = await rateLimiter.get(ctx.chat.id);
        if(entity && checkBlocked(entity)) {
          return;
        }
        await rateLimiter.consume(ctx.chat.id);
        return next();
      } catch (e) {
        if(e instanceof RateLimiterRes) {
          if(options.dynamicBlock) {
            await dynamicBlock(rateLimiter, dynamicBlockRateLimiter, ctx.chat.id.toString());
          }

          if(e.consumedPoints < rateLimiter.points + 5) {
            throw new BotError(`Rate limited, please try again in ~${Math.round(e.msBeforeNext / 1000)} seconds`);
          }
        } else {
          throw e;
        }
      }
  }
}

const dynamicBlock = async (rateLimiter: RateLimiterMemory, dynamicBlockRateLimiter: RateLimiterMemory, id: string): Promise<void> => {
  const entity = await rateLimiter.get(id);

  if(!entity || (entity.remainingPoints > 0)) {
    return;
  }

  try {
    const dynamicBlockEntity = await dynamicBlockRateLimiter.consume(id);
    rateLimiter.block(id, rateLimiter.blockDuration * (dynamicBlockEntity.consumedPoints + 1));
  } catch (e) {
    if(e instanceof RateLimiterRes) {
      rateLimiter.block(id, 0);
      throw new BotError(`You are blocked.`);
    }

    throw e;
  }
}

const checkBlocked = (entity: RateLimiterRes): boolean => {
  return entity.remainingPoints === 0 && entity.msBeforeNext === -1;
}