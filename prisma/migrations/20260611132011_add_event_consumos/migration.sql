-- AlterTable
ALTER TABLE "Event" ADD COLUMN "consumosClosedAt" DATETIME;
ALTER TABLE "Event" ADD COLUMN "consumosPaidAt" DATETIME;
ALTER TABLE "Event" ADD COLUMN "consumosStartedAt" DATETIME;

-- AlterTable
ALTER TABLE "Movement" ADD COLUMN "kind" TEXT;

-- CreateTable
CREATE TABLE "EventConsumo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventConsumo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventConsumo_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Insumo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "eventPrice" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Insumo" ("createdAt", "id", "minStock", "name", "notes", "stockQty", "unit", "updatedAt") SELECT "createdAt", "id", "minStock", "name", "notes", "stockQty", "unit", "updatedAt" FROM "Insumo";
DROP TABLE "Insumo";
ALTER TABLE "new_Insumo" RENAME TO "Insumo";
CREATE INDEX "Insumo_name_idx" ON "Insumo"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "EventConsumo_eventId_idx" ON "EventConsumo"("eventId");

-- CreateIndex
CREATE INDEX "EventConsumo_insumoId_idx" ON "EventConsumo"("insumoId");
