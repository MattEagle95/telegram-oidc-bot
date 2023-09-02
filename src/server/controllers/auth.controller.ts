import { DI } from '../../di';
import { Request, Response, Router } from 'express';
import { Issuer } from 'openid-client';
import z from 'zod';

import { CONFIG } from '@/config';
import { routeHandler, routeParser } from '@/utils/utils';

const router = Router();

const cbSchema = z.object({
  query: z.object({
    chatId: z.string(),
  }),
});

router.get(
  '/cb',
  routeHandler(async (req: Request, res: Response) => {
    const {
      query: { chatId },
    } = await routeParser(cbSchema, req);

    const chat = await DI.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
      },
    });

    const issuer = await Issuer.discover(CONFIG.oidc.issuer);
    const oidcClient = new issuer.Client({
      client_id: CONFIG.oidc.clientId,
      client_secret: CONFIG.oidc.clientSecret,
      response_types: ['code'],
    });
    const params = oidcClient.callbackParams(req);
    const tokenSet = await oidcClient.callback(
      `${CONFIG.server.url}/cb?chatId=${chatId}`,
      params,
      { code_verifier: chat.oidcCodeVerifier! },
    );

    await DI.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        oidcCodeVerifier: undefined,
        oidcAccessToken: tokenSet.access_token!,
        oidcExpiresAt: new Date(tokenSet.expires_at!),
      },
    });

    DI.bot.bot.telegram.sendMessage(chatId, 'Authenticated!');
    res.redirect(`tg://resolve?domain=${DI.bot.bot.botInfo?.username}`);
  }),
);

export { router as authController };
