import Link from "next/link";
import { listServices } from "@/lib/services/serviceService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { DeleteServiceButton } from "./DeleteServiceButton";

export default async function ServiciosPage() {
  const services = await listServices();

  return (
    <div>
      <PageHeader
        title="Servicios"
        action={
          <Link href="/servicios/nuevo" className={cn(buttonVariants())}>
            + Nuevo servicio
          </Link>
        }
      />

      {services.length === 0 ? (
        <p className="text-muted-foreground">No hay servicios todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Costo</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Ganancia</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{s.description ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.proveedor?.name ?? "—"}</td>
                  <td className="px-4 py-3">${s.cost.toFixed(2)}</td>
                  <td className="px-4 py-3">${s.price.toFixed(2)}</td>
                  <td className="px-4 py-3">${(s.price - s.cost).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/servicios/${s.id}/editar`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Editar
                      </Link>
                      <DeleteServiceButton id={s.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
