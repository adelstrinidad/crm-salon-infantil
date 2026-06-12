/*
  Warnings:

  - You are about to drop the column `consumosPaidAt` on the `Event` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientId" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PRESUPUESTADO',
    "details" TEXT,
    "notes" TEXT,
    "totalPrice" INTEGER NOT NULL DEFAULT 0,
    "consumosStartedAt" DATETIME,
    "consumosClosedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("clientId", "clientName", "consumosClosedAt", "consumosStartedAt", "createdAt", "details", "endAt", "eventType", "id", "name", "notes", "startAt", "state", "totalPrice", "updatedAt") SELECT "clientId", "clientName", "consumosClosedAt", "consumosStartedAt", "createdAt", "details", "endAt", "eventType", "id", "name", "notes", "startAt", "state", "totalPrice", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");
CREATE INDEX "Event_state_idx" ON "Event"("state");
CREATE INDEX "Event_clientId_idx" ON "Event"("clientId");
CREATE TABLE "new_EventConsumo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "payerType" TEXT NOT NULL DEFAULT 'CLIENTE',
    "payerLabel" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventConsumo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventConsumo_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventConsumo" ("createdAt", "eventId", "id", "insumoId", "qty", "tableNumber", "unitPrice") SELECT "createdAt", "eventId", "id", "insumoId", "qty", "tableNumber", "unitPrice" FROM "EventConsumo";
DROP TABLE "EventConsumo";
ALTER TABLE "new_EventConsumo" RENAME TO "EventConsumo";
CREATE INDEX "EventConsumo_eventId_idx" ON "EventConsumo"("eventId");
CREATE INDEX "EventConsumo_insumoId_idx" ON "EventConsumo"("insumoId");
CREATE INDEX "EventConsumo_payerType_idx" ON "EventConsumo"("payerType");
CREATE TABLE "new_RemovedConsumo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "insumoName" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonText" TEXT,
    "payerType" TEXT NOT NULL DEFAULT 'CLIENTE',
    "payerLabel" TEXT,
    "originalCreatedAt" DATETIME NOT NULL,
    "removedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_RemovedConsumo" ("eventId", "eventName", "id", "insumoName", "originalCreatedAt", "qty", "reason", "reasonText", "removedAt", "tableNumber", "unitPrice") SELECT "eventId", "eventName", "id", "insumoName", "originalCreatedAt", "qty", "reason", "reasonText", "removedAt", "tableNumber", "unitPrice" FROM "RemovedConsumo";
DROP TABLE "RemovedConsumo";
ALTER TABLE "new_RemovedConsumo" RENAME TO "RemovedConsumo";
CREATE INDEX "RemovedConsumo_eventId_idx" ON "RemovedConsumo"("eventId");
CREATE INDEX "RemovedConsumo_reason_idx" ON "RemovedConsumo"("reason");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
