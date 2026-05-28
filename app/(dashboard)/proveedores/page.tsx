import Link from "next/link";
import { listProveedores } from "@/lib/proveedores/proveedorService";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteProveedorButton } from "./DeleteProveedorButton";

export default async function ProveedoresPage() {
  const proveedores = await listProveedores();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Link href="/proveedores/nuevo" className={cn(buttonVariants())}>
          + Nuevo proveedor
        </Link>
      </div>

      {proveedores.length === 0 ? (
        <p className="text-muted-foreground">No hay proveedores todavía.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Descripción</th>
              <th className="py-2 pr-4">Teléfono</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/40">
                <td className="py-2 pr-4 font-medium">{p.name}</td>
                <td className="py-2 pr-4 text-muted-foreground">{p.description ?? "—"}</td>
                <td className="py-2 pr-4 text-muted-foreground">{p.phone ?? "—"}</td>
                <td className="py-2 pr-4 text-muted-foreground">{p.email ?? "—"}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/proveedores/${p.id}/editar`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Editar
                    </Link>
                    <DeleteProveedorButton id={p.id} />
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
