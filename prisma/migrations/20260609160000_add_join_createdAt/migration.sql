-- Add createdAt to the obligation/assignment join rows so the pago tables can
-- show a "Fecha de alta" (when the row was created) alongside the event date and
-- paidAt. SQLite forbids a CURRENT_TIMESTAMP default on ALTER ADD COLUMN, so each
-- table is rebuilt (CREATE TABLE allows it). Existing rows get the migration-time
-- timestamp via the column default (createdAt omitted from the INSERT...SELECT).
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- EventProvider
CREATE TABLE "new_EventProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventProvider_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventProvider" ("id","eventId","providerId","cost","paid","paidAt") SELECT "id","eventId","providerId","cost","paid","paidAt" FROM "EventProvider";
DROP TABLE "EventProvider";
ALTER TABLE "new_EventProvider" RENAME TO "EventProvider";
CREATE INDEX "EventProvider_providerId_idx" ON "EventProvider"("providerId");
CREATE UNIQUE INDEX "EventProvider_eventId_providerId_key" ON "EventProvider"("eventId", "providerId");

-- EventService
CREATE TABLE "new_EventService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventService_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventService" ("id","eventId","serviceId","qty","paid","paidAt") SELECT "id","eventId","serviceId","qty","paid","paidAt" FROM "EventService";
DROP TABLE "EventService";
ALTER TABLE "new_EventService" RENAME TO "EventService";
CREATE UNIQUE INDEX "EventService_eventId_serviceId_key" ON "EventService"("eventId", "serviceId");
CREATE INDEX "EventService_serviceId_idx" ON "EventService"("serviceId");

-- EventStaff
CREATE TABLE "new_EventStaff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "estMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventStaff_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventStaff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventStaff" ("id","eventId","staffId","estMinutes","actualMinutes","paid","paidAt") SELECT "id","eventId","staffId","estMinutes","actualMinutes","paid","paidAt" FROM "EventStaff";
DROP TABLE "EventStaff";
ALTER TABLE "new_EventStaff" RENAME TO "EventStaff";
CREATE INDEX "EventStaff_staffId_idx" ON "EventStaff"("staffId");
CREATE UNIQUE INDEX "EventStaff_eventId_staffId_key" ON "EventStaff"("eventId", "staffId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
