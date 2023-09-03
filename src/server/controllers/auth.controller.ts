import { DI } from '../../di';
import { HttpError } from '../../errors/http.error';
import express, { Request, Response, Router } from 'express';
import { Issuer } from 'openid-client';
import path from 'path';
import z from 'zod';

import { ENV } from '@/env';
import { routeHandler, routeParser } from '@/utils/utils';

const router = Router();

router.use(
  '/secret',
  express.static(path.join(__dirname, 'public', 'auth', 'secret')),
);

const secretCbSchema = z.object({
  body: z.object({
    chatId: z.coerce.number(),
    secret: z.string(),
  }),
});

router.post(
  '/secret/cb',
  routeHandler(async (req: Request, res: Response) => {
    const {
      body: { chatId, secret },
    } = await routeParser(secretCbSchema, req);

    if (!ENV.AUTH_SECRET) {
      throw new Error();
    }

    if (secret !== ENV.AUTH_SECRET) {
      throw new HttpError('Unauthenticated', 403, 'UnauthenticatedError');
    }

    const data = {
      verifiedBy: 'secret',
      verifiedAt: new Date(),
    };

    await DI.prisma.chat.upsert({
      where: {
        id: chatId,
      },
      update: data,
      create: {
        id: chatId,
        ...data,
      },
    });

    DI.bot.bot.telegram.sendMessage(chatId, 'Authenticated!');
    res.redirect(`tg://resolve?domain=${DI.bot.bot.botInfo?.username}`);
  }),
);

const oidcCbSchema = z.object({
  query: z.object({
    chatId: z.number(),
  }),
});

router.get(
  '/oidc/cb',
  routeHandler(async (req: Request, res: Response) => {
    const {
      query: { chatId },
    } = await routeParser(oidcCbSchema, req);

    if (
      !ENV.AUTH_OIDC_ISSUER ||
      !ENV.AUTH_OIDC_CLIENT_ID ||
      !ENV.AUTH_OIDC_CLIENT_SECRET
    ) {
      return;
    }

    const chat = await DI.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
      },
    });

    if (!chat.oidcCodeVerifier) {
      throw new HttpError('No code verifier', 400, 'BadRequestError');
    }

    const issuer = await Issuer.discover(ENV.AUTH_OIDC_ISSUER);
    const oidcClient = new issuer.Client({
      client_id: ENV.AUTH_OIDC_CLIENT_ID,
      client_secret: ENV.AUTH_OIDC_CLIENT_SECRET,
      response_types: ['code'],
    });
    const params = oidcClient.callbackParams(req);
    const tokenSet = await oidcClient.callback(
      `${ENV.SERVER_URL}/auth/oidc/cb?chatId=${chatId}`,
      params,
      { code_verifier: chat.oidcCodeVerifier },
    );

    if (!tokenSet.access_token) {
      throw new HttpError('No access token', 400, 'BadRequestError');
    }

    const data = {
      oidcCodeVerifier: undefined,
      verifiedBy: 'oidc',
      verifiedAt: new Date(),
    };

    await DI.prisma.chat.upsert({
      where: {
        id: chatId,
      },
      update: data,
      create: {
        id: chatId,
        ...data,
      },
    });

    DI.bot.bot.telegram.sendMessage(chatId, 'Authenticated!');
    res.redirect(`tg://resolve?domain=${DI.bot.bot.botInfo?.username}`);
  }),
);

export { router as authController };
