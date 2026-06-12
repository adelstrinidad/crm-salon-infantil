-- CreateTable
CREATE TABLE "RemovedConsumo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "insumoName" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonText" TEXT,
    "originalCreatedAt" DATETIME NOT NULL,
    "removedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "RemovedConsumo_eventId_idx" ON "RemovedConsumo"("eventId");

-- CreateIndex
CREATE INDEX "RemovedConsumo_reason_idx" ON "RemovedConsumo"("reason");
