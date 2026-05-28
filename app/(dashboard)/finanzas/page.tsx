import Link from "next/link";
import { getAccountsWithBalance, listMovements } from "@/lib/finanzas/finanzasService";
import { buttonVariants } from "@/components/ui/button";
import { MOVEMENT_TYPE_LABELS, MOVEMENT_SIGN } from "@/lib/finanzas/schema";
import { cn } from "@/lib/utils";
import { DeleteMovementButton } from "./DeleteMovementButton";

export default async function FinanzasPage() {
  const [accounts, movements] = await Promise.all([
    getAccountsWithBalance(),
    listMovements(30),
  ]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-10">
      {/* Accounts summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Finanzas</h1>
          <div className="flex gap-2">
            <Link href="/finanzas/cuentas/nueva" className={cn(buttonVariants({ variant: "outline" }))}>
              + Cuenta
            </Link>
            <Link href="/finanzas/movimientos/nuevo" className={cn(buttonVariants())}>
              + Movimiento
            </Link>
          </div>
        </div>

        {accounts.length === 0 ? (
          <p className="text-muted-foreground">Sin cuentas. Creá una para empezar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {accounts.map((a) => (
              <div key={a.id} className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.name}</span>
                  <Link
                    href={`/finanzas/cuentas/${a.id}/editar`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Editar
                  </Link>
                </div>
                {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                <p className={`text-xl font-bold ${a.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${a.balance.toFixed(2)}
                </p>
              </div>
            ))}
            <div className="border rounded-lg p-4 bg-muted/30 space-y-1">
              <span className="font-medium text-muted-foreground">Balance total</span>
              <p className={`text-xl font-bold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${totalBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent movements */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Movimientos recientes</h2>
        {movements.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin movimientos todavía.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Cuenta</th>
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4 text-right">Monto</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
                return (
                  <tr key={m.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {new Date(m.date).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sign > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {MOVEMENT_TYPE_LABELS[m.type as keyof typeof MOVEMENT_TYPE_LABELS]}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{m.account.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{m.description ?? "—"}</td>
                    <td className={`py-2 pr-4 text-right font-medium ${sign > 0 ? "text-green-600" : "text-red-600"}`}>
                      {sign > 0 ? "+" : "−"}${m.amount.toFixed(2)}
                    </td>
                    <td className="py-2">
                      <DeleteMovementButton id={m.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
