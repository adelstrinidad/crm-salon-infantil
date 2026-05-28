import Link from "next/link";
import { listEventTypes } from "@/lib/eventTypes/eventTypeService";
import { DeleteEventTypeButton } from "./DeleteEventTypeButton";

export default async function TiposEventoPage() {
  const types = await listEventTypes();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tipos de evento</h1>
        <Link
          href="/tipos-evento/nuevo"
          className="inline-flex items-center px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          + Nuevo tipo
        </Link>
      </div>

      {types.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin tipos de evento. Creá uno para usarlo en los eventos.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2 pr-4">{t.name}</td>
                <td className="py-2 flex gap-2">
                  <Link
                    href={`/tipos-evento/${t.id}/editar`}
                    className="text-sm px-3 py-1 rounded border hover:bg-muted"
                  >
                    Editar
                  </Link>
                  <DeleteEventTypeButton id={t.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
