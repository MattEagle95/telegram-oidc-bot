import { DI } from '../../di';
import { Issuer, generators } from 'openid-client';
import { Context } from 'telegraf';
import { URL } from 'url';

import { ENV } from '@/env';
import { BotError } from '@/errors/bot.error';
import { authMethods, commandArgs } from '@/utils/utils';

export async function authCommand(ctx: Context): Promise<void> {
  if (!ctx.chat) {
    throw new BotError('Chat not found');
  }

  const args = commandArgs(ctx);
  const method = args[0];

  switch (method) {
    case 'secret':
      await authSecret(ctx);
      break;

    case 'oidc':
      await authOIDC(ctx);
      break;

    default:
      throw new BotError(`Authentication method required (${authMethods()})`);
  }
}

async function authSecret(ctx: Context): Promise<void> {
  if (!ctx.chat) {
    throw new BotError('Chat not found');
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
      id: ctx.chat.id,
    },
    update: data,
    create: {
      id: ctx.chat.id,
      ...data,
    },
  });

  ctx.reply('Authenticated!');
}

async function authOIDC(ctx: Context): Promise<void> {
  if (!ctx.chat) {
    throw new BotError('Chat not found');
  }

  if (
    !ENV.AUTH_OIDC_ISSUER ||
    !ENV.AUTH_OIDC_CLIENT_ID ||
    !ENV.AUTH_OIDC_CLIENT_SECRET
  ) {
    return;
  }

  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const issuer = await Issuer.discover(ENV.AUTH_OIDC_ISSUER);
  const oidcClient = new issuer.Client({
    client_id: ENV.AUTH_OIDC_CLIENT_ID,
    client_secret: ENV.AUTH_OIDC_CLIENT_SECRET,
    response_types: ['code'],
  });

  const redirectUrl = new URL(`auth/cb?chatId=${ctx.chat.id}`, ENV.SERVER_URL);
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
      id: ctx.chat.id,
    },
    update: data,
    create: {
      id: ctx.chat.id,
      ...data,
    },
  });

  ctx.reply(url);
}
