import Link from "next/link";
import { listServices } from "@/lib/services/serviceService";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteServiceButton } from "./DeleteServiceButton";

export default async function ServiciosPage() {
  const services = await listServices();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <Link href="/servicios/nuevo" className={cn(buttonVariants())}>
          + Nuevo servicio
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="text-muted-foreground">No hay servicios todavía.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Descripción</th>
              <th className="py-2 pr-4">Proveedor</th>
              <th className="py-2 pr-4">Costo</th>
              <th className="py-2 pr-4">Precio</th>
              <th className="py-2 pr-4">Ganancia</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b hover:bg-muted/40">
                <td className="py-2 pr-4">{s.name}</td>
                <td className="py-2 pr-4 text-muted-foreground text-xs max-w-[200px] truncate">{s.description ?? "—"}</td>
                <td className="py-2 pr-4 text-muted-foreground">{s.proveedor?.name ?? "—"}</td>
                <td className="py-2 pr-4">${s.cost.toFixed(2)}</td>
                <td className="py-2 pr-4">${s.price.toFixed(2)}</td>
                <td className="py-2 pr-4">${(s.price - s.cost).toFixed(2)}</td>
                <td className="py-2">
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
      )}
    </div>
  );
}
