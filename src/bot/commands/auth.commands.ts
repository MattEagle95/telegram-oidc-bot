import { CONFIG } from '../../config';
import { DI } from '../../di';
import { Issuer, generators } from 'openid-client';
import { Context } from 'telegraf';
import { URL } from 'url';

export const AuthCommand = async (ctx: Context): Promise<void> => {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    throw new Error('Chat id not found');
  }

  const chat = await DI.prisma.chat.findUnique({
    where: {
      id: chatId,
    },
  });

  if (chat && chat.oidcExpiresAt && Date.now() > chat.oidcExpiresAt.getTime()) {
    ctx.reply('Already authenticated');
    return;
  }

  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const redirectUrl = new URL(`cb?chatId=${chatId}`, CONFIG.server.host);
  const issuer = await Issuer.discover(CONFIG.oidc.issuer);
  const oidcClient = new issuer.Client({
    client_id: CONFIG.oidc.clientId,
    client_secret: CONFIG.oidc.clientSecret,
    response_types: ['code'],
  });
  const url = oidcClient.authorizationUrl({
    scope: 'openid',
    redirect_uri: redirectUrl.toString(),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (chat) {
    await DI.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        oidcCodeVerifier: codeVerifier,
      },
    });
  } else {
    await DI.prisma.chat.create({
      data: {
        id: chatId,
        oidcCodeVerifier: codeVerifier,
      },
    });
  }

  ctx.reply(url);
};
