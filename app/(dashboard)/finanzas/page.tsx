import Link from "next/link";
import { getAccountsWithBalance, listMovements } from "@/lib/finanzas/finanzasService";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { Money, signTone } from "@/components/ui/money";
import { MOVEMENT_TYPE_LABELS, MOVEMENT_SIGN } from "@/lib/finanzas/schema";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { DeleteMovementButton } from "./DeleteMovementButton";
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet, ArrowLeftRight } from "lucide-react";

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
        <PageHeader
          title="Finanzas"
          action={
            <>
              <Link href="/finanzas/cuentas/nueva" className={cn(buttonVariants({ variant: "outline" }))}>
                + Cuenta
              </Link>
              <Link href="/finanzas/movimientos/nuevo" className={cn(buttonVariants())}>
                + Movimiento
              </Link>
            </>
          }
        />

        {accounts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Sin cuentas"
            description="Creá una cuenta para empezar a registrar movimientos."
            action={
              <Link href="/finanzas/cuentas/nueva" className={cn(buttonVariants())}>
                + Cuenta
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {accounts.map((a) => (
              <Card key={a.id} className="p-5 space-y-1">
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
                <Money value={a.balance} signed className="text-xl font-semibold">
                  {formatMoney(a.balance)}
                </Money>
              </Card>
            ))}
            <Card className="p-5 bg-muted/30 space-y-1">
              <span className="font-medium text-muted-foreground">Balance total</span>
              <Money value={totalBalance} signed className="text-xl font-semibold block">
                {formatMoney(totalBalance)}
              </Money>
            </Card>
          </div>
        )}
      </div>

      {/* Recent movements */}
      <div>
        <SectionTitle className="mb-3">Movimientos recientes</SectionTitle>
        {movements.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Sin movimientos todavía"
            description="Los ingresos y egresos que registres van a aparecer acá."
            action={
              <Link href="/finanzas/movimientos/nuevo" className={cn(buttonVariants())}>
                + Movimiento
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Cuenta</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {movements.map((m) => {
                  const sign = MOVEMENT_SIGN[m.type as keyof typeof MOVEMENT_SIGN];
                  const tone = signTone(sign);
                  return (
                    <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(m.date).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            tone === "success"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-loss/10 text-loss border-loss/20",
                          )}
                        >
                          {MOVEMENT_TYPE_LABELS[m.type as keyof typeof MOVEMENT_TYPE_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-2">{m.account.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.description ?? "—"}</td>
                      <td className="px-4 py-2 text-right">
                        <Money tone={tone} className="font-medium">
                          {sign > 0 ? "+" : "−"}{formatMoney(m.amount)}
                        </Money>
                      </td>
                      <td className="px-4 py-2">
                        <DeleteMovementButton id={m.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
