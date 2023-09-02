import { NextFunction, Request, Response } from 'express';
import { Context } from 'telegraf';
import { AnyZodObject, ZodError, z } from 'zod';

import { ENV } from '@/env';
import { HttpError } from '@/errors/http.error';

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
      throw new HttpError(msgs.join('\\n'), 400, 'BadRequestError');
    }

    throw new Error(JSON.stringify(e));
  }
}

export function commandArgs(ctx: Context): string[] {
  const payload = (ctx as any)?.payload;
  if (!payload) {
    return [];
  }
  return payload.split(' ');
}

export function authMethods(): string[] {
  const methods = [];

  if (ENV.AUTH_SECRET) {
    methods.push('secret');
  }

  if (
    ENV.AUTH_OIDC_ISSUER &&
    ENV.AUTH_OIDC_CLIENT_ID &&
    ENV.AUTH_OIDC_CLIENT_SECRET
  ) {
    methods.push('oidc');
  }

  return methods;
}
