import { DI } from '../../di';
import { Issuer, generators } from 'openid-client';
import { Context } from 'telegraf';
import { URL } from 'url';

import { ENV, ENV_AUTH_OIDC } from '@/env';
import { commandHandler } from '@/utils/utils';

export const authSecretCommand = commandHandler(
  async (ctx: Context): Promise<void> => {
    if (!ctx.message) {
      return;
    }

    if (!ENV.AUTH_SECRET) {
      return;
    }

    const url = new URL(
      `auth/secret?chatId=${ctx.message.chat.id}`,
      ENV.SERVER_URL,
    );

    ctx.reply(url.toString());
  },
);

export const authOIDCCommand = commandHandler(
  async (ctx: Context): Promise<void> => {
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
      `auth/oidc/cb?chatId=${ctx.message.from.id}`,
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
  },
);
