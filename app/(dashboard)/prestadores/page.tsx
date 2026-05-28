import Link from "next/link";
import { listProviders } from "@/lib/providers/providerService";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteProviderButton } from "./DeleteProviderButton";

export default async function PrestadoresPage() {
  const providers = await listProviders();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Prestadores</h1>
        <Link href="/prestadores/nuevo" className={cn(buttonVariants())}>
          + Nuevo prestador
        </Link>
      </div>

      {providers.length === 0 ? (
        <p className="text-muted-foreground">No hay prestadores todavía.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Rol</th>
              <th className="py-2 pr-4">Costo/evento</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/40">
                <td className="py-2 pr-4">{p.name}</td>
                <td className="py-2 pr-4 text-muted-foreground">{p.role ?? "—"}</td>
                <td className="py-2 pr-4">${p.cost.toFixed(2)}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/prestadores/${p.id}/editar`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Editar
                    </Link>
                    <DeleteProviderButton id={p.id} />
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
