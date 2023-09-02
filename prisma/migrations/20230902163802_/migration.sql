/*
  Warnings:

  - You are about to drop the column `oidcAccessToken` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `oidcExpiresAt` on the `Chat` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oidcCodeVerifier" TEXT,
    "verifiedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Chat" ("createdAt", "id", "oidcCodeVerifier", "updatedAt") SELECT "createdAt", "id", "oidcCodeVerifier", "updatedAt" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
