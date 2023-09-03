import { DI } from "@/di";
import { ENV } from "@/env";
import schedule from "node-schedule";

export const cleanupJob = () => {
    schedule.scheduleJob('42 * * * *', async () => {
        const unverifiedChats = await DI.prisma.chat.findMany({
            where: {
              verifiedAt: {
                gt: new Date(Date.now() - ENV.AUTH_SESSION_EXPIRY * 1000)
              }
            },
          });

        for await(const unverifiedChat of unverifiedChats) {
            await DI.prisma.chat.update({
                where: {
                    id: unverifiedChat.id
                },
                data: {
                    verifiedBy: null,
                    verifiedAt: null,
                }
            });
            await DI.bot.bot.telegram.sendMessage(unverifiedChat.id, 'Authentication expired. Please re-authenticate.');
        }
      });
}