-- CreateTable
CREATE TABLE "ReversedPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "eventId" TEXT,
    "eventName" TEXT,
    "entityName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonText" TEXT,
    "originalMovementId" TEXT NOT NULL,
    "reversalMovementId" TEXT NOT NULL,
    "originalPaidAt" DATETIME NOT NULL,
    "reversedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Compra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proveedorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "paidMovementId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Compra_paidMovementId_fkey" FOREIGN KEY ("paidMovementId") REFERENCES "Movement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Compra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Compra" ("createdAt", "date", "id", "notes", "paid", "paidAt", "proveedorId", "total", "updatedAt") SELECT "createdAt", "date", "id", "notes", "paid", "paidAt", "proveedorId", "total", "updatedAt" FROM "Compra";
DROP TABLE "Compra";
ALTER TABLE "new_Compra" RENAME TO "Compra";
CREATE UNIQUE INDEX "Compra_paidMovementId_key" ON "Compra"("paidMovementId");
CREATE INDEX "Compra_proveedorId_idx" ON "Compra"("proveedorId");
CREATE INDEX "Compra_paid_idx" ON "Compra"("paid");
CREATE INDEX "Compra_date_idx" ON "Compra"("date");
CREATE TABLE "new_EventProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "paidMovementId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventProvider_paidMovementId_fkey" FOREIGN KEY ("paidMovementId") REFERENCES "Movement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventProvider_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventProvider" ("cost", "createdAt", "eventId", "id", "paid", "paidAt", "providerId") SELECT "cost", "createdAt", "eventId", "id", "paid", "paidAt", "providerId" FROM "EventProvider";
DROP TABLE "EventProvider";
ALTER TABLE "new_EventProvider" RENAME TO "EventProvider";
CREATE UNIQUE INDEX "EventProvider_paidMovementId_key" ON "EventProvider"("paidMovementId");
CREATE INDEX "EventProvider_providerId_idx" ON "EventProvider"("providerId");
CREATE UNIQUE INDEX "EventProvider_eventId_providerId_key" ON "EventProvider"("eventId", "providerId");
CREATE TABLE "new_EventService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "paidMovementId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventService_paidMovementId_fkey" FOREIGN KEY ("paidMovementId") REFERENCES "Movement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventService_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventService" ("createdAt", "eventId", "id", "paid", "paidAt", "qty", "serviceId") SELECT "createdAt", "eventId", "id", "paid", "paidAt", "qty", "serviceId" FROM "EventService";
DROP TABLE "EventService";
ALTER TABLE "new_EventService" RENAME TO "EventService";
CREATE UNIQUE INDEX "EventService_paidMovementId_key" ON "EventService"("paidMovementId");
CREATE INDEX "EventService_serviceId_idx" ON "EventService"("serviceId");
CREATE UNIQUE INDEX "EventService_eventId_serviceId_key" ON "EventService"("eventId", "serviceId");
CREATE TABLE "new_EventStaff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "estMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "paidMovementId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventStaff_paidMovementId_fkey" FOREIGN KEY ("paidMovementId") REFERENCES "Movement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventStaff_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventStaff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventStaff" ("actualMinutes", "createdAt", "estMinutes", "eventId", "id", "paid", "paidAt", "staffId") SELECT "actualMinutes", "createdAt", "estMinutes", "eventId", "id", "paid", "paidAt", "staffId" FROM "EventStaff";
DROP TABLE "EventStaff";
ALTER TABLE "new_EventStaff" RENAME TO "EventStaff";
CREATE UNIQUE INDEX "EventStaff_paidMovementId_key" ON "EventStaff"("paidMovementId");
CREATE INDEX "EventStaff_staffId_idx" ON "EventStaff"("staffId");
CREATE UNIQUE INDEX "EventStaff_eventId_staffId_key" ON "EventStaff"("eventId", "staffId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ReversedPayment_kind_idx" ON "ReversedPayment"("kind");

-- CreateIndex
CREATE INDEX "ReversedPayment_eventId_idx" ON "ReversedPayment"("eventId");

-- CreateIndex
CREATE INDEX "ReversedPayment_reason_idx" ON "ReversedPayment"("reason");
