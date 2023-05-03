import { DI } from '../di';
import { Request, Response, Router } from 'express';

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

  const params = DI.oidcClient.callbackParams(req);
  const tokenSet = await DI.oidcClient.callback(
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

  DI.bot.telegram.sendMessage(chatId, 'Authenticated!');
  res.redirect(`tg://resolve?domain=${DI.bot.botInfo?.username}`);
});

export { router as CallbackController };
