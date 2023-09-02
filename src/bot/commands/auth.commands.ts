import { CONFIG } from '../../config';
import { DI } from '../../di';
import { Issuer, generators } from 'openid-client';
import { Context } from 'telegraf';
import { URL } from 'url';

export async function authCommand(ctx: Context): Promise<void> {
  if (!ctx.chat) {
    throw new Error('Chat not found');
  }

  const chat = await DI.prisma.chat.findFirstOrThrow({
    where: {
      id: ctx.chat.id.toString(),
    },
  });

  if (chat && chat.oidcExpiresAt && Date.now() > chat.oidcExpiresAt.getTime()) {
    ctx.reply('Already authenticated');
    return;
  }

  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const issuer = await Issuer.discover(CONFIG.oidc.issuer);
  const oidcClient = new issuer.Client({
    client_id: CONFIG.oidc.clientId,
    client_secret: CONFIG.oidc.clientSecret,
    response_types: ['code'],
  });

  const redirectUrl = new URL(
    `auth/cb?chatId=${ctx.chat.id}`,
    CONFIG.server.url,
  );
  const url = oidcClient.authorizationUrl({
    scope: 'openid',
    redirect_uri: redirectUrl.toString(),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (chat) {
    await DI.prisma.chat.update({
      where: {
        id: ctx.chat.id.toString(),
      },
      data: {
        oidcCodeVerifier: codeVerifier,
      },
    });
  } else {
    await DI.prisma.chat.create({
      data: {
        id: ctx.chat.id.toString(),
        oidcCodeVerifier: codeVerifier,
      },
    });
  }

  ctx.reply(url);
}
