import Link from "next/link";
import { listEventTypes } from "@/lib/eventTypes/eventTypeService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { DeleteEventTypeButton } from "./DeleteEventTypeButton";

export default async function TiposEventoPage() {
  const types = await listEventTypes();

  return (
    <div>
      <PageHeader
        title="Tipos de evento"
        action={
          <Link href="/tipos-evento/nuevo" className={cn(buttonVariants())}>
            + Nuevo tipo
          </Link>
        }
      />

      {types.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin tipos de evento. Creá uno para usarlo en los eventos.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/tipos-evento/${t.id}/editar`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Editar
                      </Link>
                      <DeleteEventTypeButton id={t.id} />
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
