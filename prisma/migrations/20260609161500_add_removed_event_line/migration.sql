-- Append-only audit of removed event lines (provider/service/staff). Snapshot is
-- written in the same transaction that deletes the live join row.
CREATE TABLE "RemovedEventLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityRole" TEXT,
    "amount" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "originalCreatedAt" DATETIME NOT NULL,
    "removedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "RemovedEventLine_kind_idx" ON "RemovedEventLine"("kind");
CREATE INDEX "RemovedEventLine_eventId_idx" ON "RemovedEventLine"("eventId");
