import * as dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const envSchema = z.object({
  SERVER_URL: z.string(),
  SERVER_PORT: z.string(),
  BOT_TOKEN: z.string(),
  DATABASE_URL: z.string(),
  OIDC_ISSUER: z.string(),
  OIDC_CLIENT_ID: z.string(),
  OIDC_CLIENT_SECRET: z.string(),
});

export const ENV = envSchema.parse(process.env);
