import * as dotenv from 'dotenv';
import z from 'zod';

dotenv.config();

const envSchema = z.object({
  SERVER_HOST: z.string(),
  SERVER_PORT: z.string(),
  BOT_TOKEN: z.string(),
  DATABASE_URL: z.string(),
  OIDC_ISSUER: z.string(),
  OIDC_CLIENT_ID: z.string(),
  OIDC_CLIENT_SECRET: z.string(),
});

export const ENV = envSchema.parse(process.env);

export const getEnvIssues = (): z.ZodIssue[] | void => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) return result.error.issues;
};
