import * as dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const envSchema = z.object({
  SERVER_URL: z.string().default('http://localhost:3000'),
  SERVER_PORT: z.coerce.number().default(3000),
  BOT_TOKEN: z.string(),
  DATABASE_URL: z.string().default('file:../data/dev.db'),
  AUTH_SECRET: z.string().optional(),
  AUTH_OIDC_ISSUER: z.string().optional(),
  AUTH_OIDC_CLIENT_ID: z.string().optional(),
  AUTH_OIDC_CLIENT_SECRET: z.string().optional(),
  AUTH_SESSION_EXPIRY: z.coerce.number().default(43200),
});

export const ENV = envSchema.parse(process.env);
