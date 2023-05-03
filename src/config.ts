import * as dotenv from 'dotenv';

dotenv.config();

export interface Config {
  server: {
    url: string;
    port: string;
  };
  bot: {
    token: string;
  };
  database: {
    url: string;
  };
  oidc: {
    issuer: string;
    clientId: string;
    clientSecret: string;
  };
}

export const CONFIG: Config = {
  server: {
    url: process.env.SERVER_URL!,
    port: process.env.SERVER_PORT!,
  },
  bot: {
    token: process.env.BOT_TOKEN!,
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  oidc: {
    issuer: process.env.OIDC_ISSUER!,
    clientId: process.env.OIDC_CLIENT_ID!,
    clientSecret: process.env.OIDC_CLIENT_SECRET!,
  },
};
