-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "toAccountId" TEXT,
    "type" TEXT NOT NULL,
    "kind" TEXT,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Movement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movement_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Movement" ("accountId", "amount", "createdAt", "date", "description", "eventId", "id", "kind", "toAccountId", "type", "updatedAt") SELECT "accountId", "amount", "createdAt", "date", "description", "eventId", "id", "kind", "toAccountId", "type", "updatedAt" FROM "Movement";
DROP TABLE "Movement";
ALTER TABLE "new_Movement" RENAME TO "Movement";
CREATE INDEX "Movement_date_idx" ON "Movement"("date");
CREATE INDEX "Movement_eventId_idx" ON "Movement"("eventId");
CREATE INDEX "Movement_accountId_idx" ON "Movement"("accountId");
CREATE INDEX "Movement_toAccountId_idx" ON "Movement"("toAccountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
