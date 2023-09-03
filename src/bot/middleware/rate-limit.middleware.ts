import { BotError } from "@/errors/bot.error";
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
    points?: IRateLimiterOptions['points'];
    block?: boolean;
  },
  maxReplies?: number;
}

export const rateLimitMiddleware = (options: IRateLimiterOptions) => {
  const rateLimiter = new RateLimiterMemory(options);
  const dynamicBlockRateLimiter = new RateLimiterMemory({
    points: options.dynamicBlock?.points || 5,
    duration: options.duration,
  });

  return async (ctx: Context, next: any) => {
    if (!ctx.message) {
      console.log('NO MESSAGE')
        return;
    }

      try {
        const entity = await rateLimiter.get(ctx.message.from.id);
        if(entity && checkBlocked(entity)) {
          return;
        }
        await rateLimiter.consume(ctx.message.from.id);
        return next();
      } catch (e) {
        if(e instanceof RateLimiterRes) {
          if(options.dynamicBlock) {
            await dynamicBlock(rateLimiter, dynamicBlockRateLimiter, ctx.message.from.id.toString(), options.dynamicBlock.block);
          }

          if(e.consumedPoints < rateLimiter.points + (options.maxReplies || options.dynamicBlock?.points || 5)) {
            throw new BotError(`Rate limited, please try again in ${Math.round(e.msBeforeNext / 1000)} seconds`);
          }
        } else {
          throw e;
        }
      }
  }
}

const dynamicBlock = async (rateLimiter: RateLimiterMemory, dynamicBlockRateLimiter: RateLimiterMemory, id: string, block?: boolean): Promise<void> => {
  const entity = await rateLimiter.get(id);

  if(!entity || (entity.remainingPoints > 0)) {
    return;
  }

  try {
    const dynamicBlockEntity = await dynamicBlockRateLimiter.consume(id);
    await rateLimiter.set(id, entity.consumedPoints, rateLimiter.blockDuration * Math.pow(2, dynamicBlockEntity.consumedPoints));
  } catch (e) {
    if(e instanceof RateLimiterRes) {
      if(!block) {
        return;
      }

      await rateLimiter.block(id, 0);
      throw new BotError('You are blocked');
    }

    throw e;
  }
}

const checkBlocked = (entity: RateLimiterRes): boolean => {
  return entity.remainingPoints === 0 && entity.msBeforeNext === -1;
}