import { DI } from '../../di';
import { Issuer, generators } from 'openid-client';
import { Context } from 'telegraf';
import { URL } from 'url';

import { ENV, ENV_AUTH_OIDC } from '@/env';
import { BotError } from '@/errors/bot.error';
import { commandArgs } from '@/utils/utils';

export async function authSecret(ctx: Context): Promise<void> {
  if (!ctx.message) {
    return;
  }

  if (!ENV.AUTH_SECRET) {
    return;
  }

  const args = commandArgs(ctx);
  const secret = args[1];

  if (!secret) {
    throw new BotError('Secret required');
  }

  if (secret !== ENV.AUTH_SECRET) {
    throw new BotError('Secret wrong');
  }

  const data = {
    verifiedBy: 'secret',
    verifiedAt: new Date(),
  };

  await DI.prisma.chat.upsert({
    where: {
      id: ctx.message.from.id,
    },
    update: data,
    create: {
      id: ctx.message.from.id,
      ...data,
    },
  });

  ctx.reply('Authenticated!');
}

export async function authOIDC(ctx: Context): Promise<void> {
  if (!ctx.message) {
    return;
  }

  if (!ENV_AUTH_OIDC) {
    return;
  }

  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const issuer = await Issuer.discover(ENV.AUTH_OIDC_ISSUER!);
  const oidcClient = new issuer.Client({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    client_id: ENV.AUTH_OIDC_CLIENT_ID!,
    client_secret: ENV.AUTH_OIDC_CLIENT_SECRET,
    response_types: ['code'],
  });

  const redirectUrl = new URL(
    `auth/cb?chatId=${ctx.message.from.id}`,
    ENV.SERVER_URL,
  );
  const url = oidcClient.authorizationUrl({
    scope: 'openid',
    redirect_uri: redirectUrl.toString(),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const data = {
    oidcCodeVerifier: codeVerifier,
  };

  await DI.prisma.chat.upsert({
    where: {
      id: ctx.message.from.id,
    },
    update: data,
    create: {
      id: ctx.message.from.id,
      ...data,
    },
  });

  ctx.reply(url);
}
