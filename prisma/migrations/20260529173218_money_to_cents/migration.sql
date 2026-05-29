/*
  Warnings:

  - You are about to alter the column `totalPrice` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `amount` on the `Movement` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `cost` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `cost` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `price` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("clientId", "clientName", "createdAt", "details", "endAt", "eventType", "id", "name", "notes", "startAt", "state", "totalPrice", "updatedAt") SELECT "clientId", "clientName", "createdAt", "details", "endAt", "eventType", "id", "name", "notes", "startAt", "state", "totalPrice", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_startAt_idx" ON "Event"("startAt");
CREATE INDEX "Event_state_idx" ON "Event"("state");
CREATE INDEX "Event_clientId_idx" ON "Event"("clientId");
CREATE TABLE "new_Movement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "toAccountId" TEXT,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Movement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movement_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Movement" ("accountId", "amount", "createdAt", "date", "description", "eventId", "id", "toAccountId", "type", "updatedAt") SELECT "accountId", "amount", "createdAt", "date", "description", "eventId", "id", "toAccountId", "type", "updatedAt" FROM "Movement";
DROP TABLE "Movement";
ALTER TABLE "new_Movement" RENAME TO "Movement";
CREATE INDEX "Movement_date_idx" ON "Movement"("date");
CREATE INDEX "Movement_eventId_idx" ON "Movement"("eventId");
CREATE INDEX "Movement_accountId_idx" ON "Movement"("accountId");
CREATE INDEX "Movement_toAccountId_idx" ON "Movement"("toAccountId");
CREATE TABLE "new_Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Provider" ("cost", "createdAt", "id", "name", "role", "updatedAt") SELECT "cost", "createdAt", "id", "name", "role", "updatedAt" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "proveedorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("cost", "createdAt", "description", "id", "name", "price", "proveedorId", "updatedAt") SELECT "cost", "createdAt", "description", "id", "name", "price", "proveedorId", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_proveedorId_idx" ON "Service"("proveedorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
