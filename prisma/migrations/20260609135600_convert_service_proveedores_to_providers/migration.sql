-- Data migration: any Proveedor that backs a Service is conceptually a Prestador.
-- Create a Provider for each such Proveedor, reusing the SAME id so the
-- Service.prestadorId values carried over by the previous migration become valid
-- against the Provider FK with no UPDATE. Then delete the converted Proveedores.
-- Proveedores that back no service stay (future insumos/supplies phase).
-- On a fresh DB (migrate reset) these statements are harmless no-ops.

INSERT INTO "Provider" ("id", "name", "role", "cost", "createdAt", "updatedAt")
SELECT pv."id", pv."name", NULL, 0, pv."createdAt", pv."updatedAt"
FROM "Proveedor" pv
WHERE pv."id" IN (SELECT DISTINCT "prestadorId" FROM "Service" WHERE "prestadorId" IS NOT NULL);

DELETE FROM "Proveedor"
WHERE "id" IN (SELECT DISTINCT "prestadorId" FROM "Service" WHERE "prestadorId" IS NOT NULL);
