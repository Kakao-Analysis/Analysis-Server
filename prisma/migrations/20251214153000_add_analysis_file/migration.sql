-- CreateTable
CREATE TABLE "AnalysisFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionUuid" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisFile_sessionUuid_fkey" FOREIGN KEY ("sessionUuid") REFERENCES "Analysis" ("sessionUuid") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AnalysisFile_sessionUuid_idx" ON "AnalysisFile"("sessionUuid");

