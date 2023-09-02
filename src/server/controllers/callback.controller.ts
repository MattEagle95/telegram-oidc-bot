import { DI } from '../../di';
import { Request, Response, Router } from 'express';
import { Issuer } from 'openid-client';

import { CONFIG } from '@/config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const chatId = Number(req.query.chatId);

  if (!chatId) {
    throw new Error('Chat id not found');
  }

  const chat = await DI.prisma.chat.findUniqueOrThrow({
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
    `http://localhost:3000/cb?chatId=${chatId}`,
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
});

export { router as CallbackController };
