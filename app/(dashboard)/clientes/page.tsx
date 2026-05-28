import Link from "next/link";
import { listClients } from "@/lib/clients/clientService";
import { DeleteClientButton } from "./DeleteClientButton";

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link href="/clientes/nuevo" className="inline-flex items-center px-3 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          + Nuevo cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sin clientes registrados.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Teléfono</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2 pr-4 font-medium">
                  <Link href={`/clientes/${c.id}`} className="hover:underline">{c.name}</Link>
                </td>
                <td className="py-2 pr-4 text-muted-foreground">{c.phone ?? "—"}</td>
                <td className="py-2 pr-4 text-muted-foreground">{c.email ?? "—"}</td>
                <td className="py-2 flex gap-2">
                  <Link href={`/clientes/${c.id}/editar`} className="text-sm px-3 py-1 rounded border hover:bg-muted">
                    Editar
                  </Link>
                  <DeleteClientButton id={c.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
