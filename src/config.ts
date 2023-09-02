export const CONFIG = {
  server: {
    host: process.env.SERVER_HOST!,
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
