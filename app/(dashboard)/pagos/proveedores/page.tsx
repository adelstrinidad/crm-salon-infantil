import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

// Proveedor payments derive from purchases of insumos (gaseosas, gas, baño…),
// which belong to the upcoming stock/inventory phase. Until then this page is a
// placeholder. Service-backed payments now live under Pago a prestadores.
export default function PagosProveedoresPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pago a proveedores" />
      <EmptyState
        icon={Receipt}
        title="Compras a proveedores — próximamente"
        description="El registro de compras e insumos a proveedores (y su pago) llegará con el módulo de stock e inventario."
      />
    </div>
  );
}
