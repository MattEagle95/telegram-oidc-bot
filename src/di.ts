import { CONFIG } from './config';
import { PrismaClient } from '@prisma/client';
import { BaseClient } from 'openid-client';
import { Issuer } from 'openid-client';
import { Telegraf } from 'telegraf';

export interface DII {
  prisma: PrismaClient;
  oidcClient: BaseClient;
  bot: Telegraf;
}

export const DI: DII = {
  prisma: undefined as unknown as PrismaClient,
  oidcClient: undefined as unknown as BaseClient,
  bot: undefined as unknown as Telegraf,
};

const initializeDatabase = (): void => {
  DI.prisma = new PrismaClient();
};

const initializeOIDCClient = async (): Promise<void> => {
  const issuer = await Issuer.discover(CONFIG.oidc.issuer);
  DI.oidcClient = new issuer.Client({
    client_id: CONFIG.oidc.clientId,
    client_secret: CONFIG.oidc.clientSecret,
    response_types: ['code'],
  });
};

export const initializeDI = (): void => {
  initializeDatabase();
  initializeOIDCClient();
};
