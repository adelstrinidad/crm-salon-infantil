import Link from "next/link";
import { listProviders } from "@/lib/providers/providerService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { DeleteProviderButton } from "./DeleteProviderButton";

export default async function PrestadoresPage() {
  const providers = await listProviders();

  return (
    <div>
      <PageHeader
        title="Prestadores"
        action={
          <Link href="/prestadores/nuevo" className={cn(buttonVariants())}>
            + Nuevo prestador
          </Link>
        }
      />

      {providers.length === 0 ? (
        <p className="text-muted-foreground">No hay prestadores todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Costo/evento</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.role ?? "—"}</td>
                  <td className="px-4 py-3">{formatMoney(p.cost)}</td>
                  <td className="px-4 py-3">
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
        </div>
      )}
    </div>
  );
}
