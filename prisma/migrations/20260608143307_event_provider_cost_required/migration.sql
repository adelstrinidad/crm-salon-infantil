-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    CONSTRAINT "EventProvider_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventProvider" ("cost", "eventId", "id", "paid", "paidAt", "providerId") SELECT coalesce("cost", 0) AS "cost", "eventId", "id", "paid", "paidAt", "providerId" FROM "EventProvider";
DROP TABLE "EventProvider";
ALTER TABLE "new_EventProvider" RENAME TO "EventProvider";
CREATE INDEX "EventProvider_providerId_idx" ON "EventProvider"("providerId");
CREATE UNIQUE INDEX "EventProvider_eventId_providerId_key" ON "EventProvider"("eventId", "providerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
