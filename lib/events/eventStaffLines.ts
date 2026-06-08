// Manage EventStaff join records: assign internal hourly staff to an event,
// log estimated vs real working time, and track per-assignment payment.
import { prisma } from "@/lib/prisma";

// Assign a staff member to an event with an estimated number of minutes.
// Upsert so re-adding updates the estimate instead of erroring on the unique
// (eventId, staffId) pair. `actualMinutes` is left untouched on update.
export async function addStaffToEvent(
  eventId: string,
  staffId: string,
  estMinutes: number | null = null,
) {
  return prisma.eventStaff.upsert({
    where: { eventId_staffId: { eventId, staffId } },
    create: { eventId, staffId, estMinutes },
    update: { estMinutes },
  });
}

export async function removeStaffFromEvent(eventId: string, staffId: string) {
  return prisma.eventStaff.delete({
    where: { eventId_staffId: { eventId, staffId } },
  });
}

// Log the real hours worked after the event. Setting this resolves the
// "falta registro de empleados" flag for the assignment.
export async function setStaffActualMinutes(
  eventId: string,
  staffId: string,
  actualMinutes: number | null,
) {
  return prisma.eventStaff.update({
    where: { eventId_staffId: { eventId, staffId } },
    data: { actualMinutes },
  });
}

export async function setStaffPaid(eventId: string, staffId: string, paid: boolean) {
  return prisma.eventStaff.update({
    where: { eventId_staffId: { eventId, staffId } },
    data: { paid, paidAt: paid ? new Date() : null },
  });
}
