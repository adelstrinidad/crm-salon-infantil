-- CreateTable
CREATE TABLE "Compra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proveedorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" INTEGER NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Compra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompraLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "compraId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitCost" INTEGER NOT NULL,
    CONSTRAINT "CompraLine_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompraLine_insumoId_fkey" FOREIGN KEY ("insumoId") REFERENCES "Insumo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Compra_proveedorId_idx" ON "Compra"("proveedorId");

-- CreateIndex
CREATE INDEX "Compra_paid_idx" ON "Compra"("paid");

-- CreateIndex
CREATE INDEX "Compra_date_idx" ON "Compra"("date");

-- CreateIndex
CREATE INDEX "CompraLine_compraId_idx" ON "CompraLine"("compraId");

-- CreateIndex
CREATE INDEX "CompraLine_insumoId_idx" ON "CompraLine"("insumoId");

-- CreateIndex
CREATE INDEX "Insumo_name_idx" ON "Insumo"("name");
