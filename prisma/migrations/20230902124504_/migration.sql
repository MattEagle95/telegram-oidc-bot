-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "oidcCodeVerifier" TEXT,
    "oidcAccessToken" TEXT,
    "oidcExpiresAt" DATETIME
);
