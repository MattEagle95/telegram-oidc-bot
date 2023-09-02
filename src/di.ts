import { Bot } from './bot/bot';
import { Server } from './server/server';
import { PrismaClient } from '@prisma/client';

export interface DI {
  prisma: PrismaClient;
  server: Server;
  bot: Bot;
}

export const DI: DI = {
  prisma: undefined as unknown as PrismaClient,
  server: undefined as unknown as Server,
  bot: undefined as unknown as Bot,
};
