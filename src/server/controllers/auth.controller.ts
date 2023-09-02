import { DI } from '../../di';
import { HttpError } from '../../errors/http.error';
import { Request, Response, Router } from 'express';
import { Issuer } from 'openid-client';
import z from 'zod';

import { ENV } from '@/env';
import { routeHandler, routeParser } from '@/utils/utils';

const router = Router();

const cbSchema = z.object({
  query: z.object({
    chatId: z.number(),
  }),
});

router.get(
  '/cb',
  routeHandler(async (req: Request, res: Response) => {
    const {
      query: { chatId },
    } = await routeParser(cbSchema, req);

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
      `${ENV.SERVER_URL}/auth/cb?chatId=${chatId}`,
      params,
      { code_verifier: chat.oidcCodeVerifier },
    );

    if (!tokenSet.access_token) {
      throw new HttpError('No access token', 400, 'BadRequestError');
    }

    await DI.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        oidcCodeVerifier: undefined,
        verifiedAt: new Date(),
      },
    });

    DI.bot.bot.telegram.sendMessage(chatId, 'Authenticated!');
    res.redirect(`tg://resolve?domain=${DI.bot.bot.botInfo?.username}`);
  }),
);

export { router as authController };
