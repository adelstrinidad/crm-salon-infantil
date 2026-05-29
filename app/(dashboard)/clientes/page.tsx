import Link from "next/link";
import { listClients } from "@/lib/clients/clientService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { DeleteClientButton } from "./DeleteClientButton";

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <div>
      <PageHeader
        title="Clientes"
        action={
          <Link href="/clientes/nuevo" className={cn(buttonVariants())}>
            + Nuevo cliente
          </Link>
        }
      />

      {clients.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin clientes registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/clientes/${c.id}`} className="hover:underline">{c.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/clientes/${c.id}/editar`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Editar
                      </Link>
                      <DeleteClientButton id={c.id} />
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
