import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';

import { BadRequestError } from '@/server/errors/bad-request.error';

export const routeHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export async function routeParser<T extends AnyZodObject>(
  schema: T,
  obj: object,
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(obj);
  } catch (e) {
    if (e instanceof ZodError) {
      const msgs: string[] = [];
      e.errors.forEach((err) => {
        msgs.push(`${err.path.join('/')}: ${err.message}`);
      });
      throw new BadRequestError(msgs.join('\\n'));
    }

    throw new Error(JSON.stringify(e));
  }
}
