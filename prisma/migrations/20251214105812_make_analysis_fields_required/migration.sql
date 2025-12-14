/*
  Warnings:

  - Made the column `partnerName` on table `Analysis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `questionText` on table `Analysis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userName` on table `Analysis` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionUuid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "userName" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "empathyPreviewText" TEXT,
    "optionsJson" TEXT,
    "resultJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Analysis" ("createdAt", "empathyPreviewText", "id", "optionsJson", "partnerName", "questionText", "resultJson", "sessionUuid", "status", "updatedAt", "userName") SELECT "createdAt", "empathyPreviewText", "id", "optionsJson", "partnerName", "questionText", "resultJson", "sessionUuid", "status", "updatedAt", "userName" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE UNIQUE INDEX "Analysis_sessionUuid_key" ON "Analysis"("sessionUuid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
