"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { payStaff } from "@/lib/pagos/pagosService";
import { staffLineCost } from "@/lib/staff/hours";
import { requireSession } from "@/lib/auth/session";

// Pay an internal staff assignment. The amount is computed server-side from the
// REAL hours logged (never trusts the client): you can't pay until the hours are
// registered, which also clears the "falta registro" state for that line.
export async function pagarPersonalAction(
  eventStaffId: string,
  accountId: string
): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  if (!accountId) return { ok: false, error: "Seleccioná una cuenta" };

  const line = await prisma.eventStaff.findUnique({
    where: { id: eventStaffId },
    include: { staff: true, event: true },
  });
  if (!line) return { ok: false, error: "Asignación no encontrada" };
  if (line.paid) return { ok: false, error: "Ya está pagado" };
  if (line.actualMinutes == null) {
    return { ok: false, error: "Registrá las horas reales antes de pagar" };
  }

  const amount = staffLineCost(line.staff.hourlyRate, line.actualMinutes);
  if (amount <= 0) return { ok: false, error: "El monto a pagar es cero" };

  await payStaff(eventStaffId, {
    accountId,
    type: "EGRESO",
    amount,
    description: `Pago personal — ${line.staff.name} (${line.event.name})`,
    date: new Date(),
    toAccountId: undefined,
    eventId: undefined,
  });

  revalidatePath("/pagos/personal");
  revalidatePath(`/eventos/${line.eventId}`);
  revalidatePath(`/eventos/${line.eventId}/editar`);
  revalidatePath("/finanzas");
  revalidatePath("/finanzas/movimientos");
  return { ok: true };
}
