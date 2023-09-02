/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Chat` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "oidcCodeVerifier" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Chat" ("createdAt", "id", "oidcCodeVerifier", "updatedAt", "verifiedAt") SELECT "createdAt", "id", "oidcCodeVerifier", "updatedAt", "verifiedAt" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
