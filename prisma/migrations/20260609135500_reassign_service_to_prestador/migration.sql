-- Rename Service.proveedorId -> prestadorId and re-point the FK from Proveedor
-- to Provider (prestador). SQLite rebuilds the table; the INSERT...SELECT below
-- is hand-edited to carry the old proveedorId value into the new prestadorId
-- column (Prisma's generated copy would otherwise drop it). The carried ids
-- still reference Proveedor rows here; the next migration creates Provider rows
-- with those same ids so the FK becomes valid.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "prestadorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("cost", "createdAt", "description", "id", "name", "price", "prestadorId", "updatedAt") SELECT "cost", "createdAt", "description", "id", "name", "price", "proveedorId", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_prestadorId_idx" ON "Service"("prestadorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
