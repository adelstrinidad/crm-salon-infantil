import Link from "next/link";
import { CompraForm } from "@/components/compras/CompraForm";
import { createCompraAction } from "../actions";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Package, Truck } from "lucide-react";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { listInsumos } from "@/lib/insumos/insumoService";
import { cn } from "@/lib/utils";

export default async function NuevaCompraPage() {
  const [proveedores, insumos] = await Promise.all([listProveedores(), listInsumos()]);

  // A purchase needs at least one proveedor and one insumo to reference.
  if (proveedores.length === 0 || insumos.length === 0) {
    const missing = proveedores.length === 0 ? "proveedores" : "insumos";
    return (
      <div>
        <PageHeader title="Nueva compra" />
        <EmptyState
          icon={proveedores.length === 0 ? Truck : Package}
          title={`Primero registrá ${missing}`}
          description={`Para registrar una compra necesitás al menos un proveedor y un insumo. Te falta cargar ${missing}.`}
          action={
            <Link
              href={proveedores.length === 0 ? "/proveedores/nuevo" : "/insumos/nuevo"}
              className={cn(buttonVariants())}
            >
              Cargar {missing}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Nueva compra" />
      <CompraForm onSubmit={createCompraAction} proveedores={proveedores} insumos={insumos} />
    </div>
  );
}
