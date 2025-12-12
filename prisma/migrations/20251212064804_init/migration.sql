-- CreateTable
CREATE TABLE "Analysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionUuid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "optionsJson" TEXT,
    "resultJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_sessionUuid_key" ON "Analysis"("sessionUuid");
