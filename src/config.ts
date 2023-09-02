import { ENV } from './env';

export const CONFIG = {
  server: {
    url: ENV.SERVER_URL,
    port: ENV.SERVER_PORT,
  },
  bot: {
    token: ENV.BOT_TOKEN,
  },
  database: {
    url: ENV.DATABASE_URL,
  },
  oidc: {
    issuer: ENV.OIDC_ISSUER,
    clientId: ENV.OIDC_CLIENT_ID,
    clientSecret: ENV.OIDC_CLIENT_SECRET,
  },
};
