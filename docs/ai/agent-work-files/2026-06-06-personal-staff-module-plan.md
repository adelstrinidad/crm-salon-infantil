# Plan — Módulo "Personal" (Staff interno horario)

**Fecha**: 2026-06-06
**Estado**: Plan aprobado por usuario en decisiones; pendiente review final antes de F1.
**UI en español, identificadores en inglés.**

---

## 1. Problema

El negocio tiene empleados internos pagados **por hora**, no por evento. Un evento dura
p.ej. 3h, pero el empleado trabaja 4–5h (preparativos, acomodar el lugar al finalizar).
Al **cliente NO se le cobra** ese extra time — ya está contemplado en el precio del evento.
Hace falta registrar las horas a pagar a cada empleado como **costo del evento (venue)**,
sin alterar el precio al cliente, y poder hacerlo aunque el evento ya esté cobrado.

## 2. Conceptos clave / decisiones

- **Entidad nueva `Staff`**, separada de `Provider`. `Provider` = prestador externo, costo
  fijo por evento (intacto). `Staff` = empleado interno, costo por hora.
- **Horas explícitas por empleado** vía join `EventStaff`. Dos campos:
  - `estMinutes` — estimado al asignar (sirve para presupuesto/proyección).
  - `actualMinutes` — real cargado al finalizar el evento. `null` = sin registrar.
- **Flag "falta registro de empleados"** = derivado (no columna):
  `staffPending = eventStaff.some(es => es.actualMinutes == null)`.
- **Impacto financiero = solo venue.** Las horas suman a `totalCost` → bajan `profit`.
  **NO** tocan `subtotal` ni `totalPrice` (cliente no paga el extra).
  - `effectiveMinutes = actualMinutes ?? estMinutes ?? 0`
  - `staffCost = Σ round(staff.hourlyRate × effectiveMinutes / 60)` (todo en cents).
- **"Extra colaborador"** (cuando un evento necesita más colaboradores que el default) SÍ es
  parte de Staff, y en este caso **sí se le cobra al cliente**. Para no complejizar, se modela
  como **doble cara, vinculación manual en dos pasos**:
  1. Se agrega un `Service` "Extra colaborador" al evento (tiene `price` → cobra al cliente e
     impacta el costo del evento para el cliente, vía mecanismo existente de servicios).
  2. Se asigna ese empleado como `EventStaff` con sus horas (estimado/real → costo venue + pago).
  Ambos lados quedan **desacoplados** (no se auto-crean entre sí); la relación se documenta. Así
  el cobro al cliente vive en el Service y el costo/pago del empleado vive en EventStaff.
- **Staff default por evento (fuera de alcance ahora).** "Un evento normal tiene 2 empleados con
  X horas por default" es contexto operativo, no feature en esta entrega. La asignación de staff
  es 100% manual en el form. Auto-asignar defaults (por tipo de evento o global) queda para después.
- **Pago a staff** = espeja "Pago prestadores": EGRESO contra cuenta + `paid`/`paidAt`
  por `EventStaff`. Se paga sobre el **real** (`actualMinutes`).
- **Horas en UI**: formato **`hh:mm`** (ej. `4:30`). Minutos restringidos a **`00` o `30`**
  (medias horas; sin tiempos parciales). Se persiste en **minutos (Int)**, consistente con la
  convención de dinero en cents, y **validado múltiplo de 30** (Zod: `minutes % 30 === 0`).
  - Input UI: `horas` (number ≥ 0) + `minutos` (Select `00`/`30`). Helpers puros
    `formatHHMM(minutes)` (mostrar) y `parseHHMM(h, m)` (persistir) + unit test.

## 3. Modelo de datos (Prisma)

```prisma
model Staff {
  id         String       @id @default(cuid())
  name       String
  role       String?
  hourlyRate Int          @default(0)   // cents/hora
  active     Boolean      @default(true)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  events     EventStaff[]
}

model EventStaff {
  id            String    @id @default(cuid())
  eventId       String
  staffId       String
  estMinutes    Int?                       // estimado al asignar
  actualMinutes Int?                       // real al finalizar; null = sin registrar
  paid          Boolean   @default(false)
  paidAt        DateTime?
  event         Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  staff         Staff     @relation(fields: [staffId], references: [id])

  @@unique([eventId, staffId])
  @@index([staffId])
}

// Event gana: staff EventStaff[]
```

## 4. Impacto en financials

Archivo `lib/events/financials.ts` (función pura `computeEventFinancials`):

- Agregar `StaffLineInput = { effectiveMinutes: number; staff: { hourlyRate: number } }`
  a `EventLines` como `staff: StaffLineInput[]`.
- Nuevo campo `staffCost` en `EventFinancials`.
- `totalCost = serviceCost + providerCost + staffCost`.
- `subtotal`, `servicePrice`, `totalBonificado`, `totalPrice` **sin cambios** (cliente).
- `profit = subtotal - totalCost` (ahora incluye staffCost).
- **El call site** decide `effectiveMinutes` (`actualMinutes ?? estMinutes ?? 0`) y se lo pasa
  a la función pura — la función no conoce Prisma. Mantener pureza.

Actualizar todos los call sites que arman `EventLines`:
detalle de evento, página presupuesto, página edición, reports service.

## 5. Fases

### F1 — Schema + migración

- Modelos `Staff`, `EventStaff`, relación `Event.staff`.
- `npx prisma migrate dev --name add_staff_module` + `prisma generate`.
- Seed: agregar unos pocos `Staff` al seed existente.
- **DoD**: migración aplica limpia, client regenerado, seed corre.

### F2 — Domain `lib/staff`

- `staffService.ts`: `listStaff`, `listStaffFiltered` (q/sort/skip/take), `getStaff`,
  `createStaff`, `updateStaff`, `deleteStaff`. Espeja `lib/providers/providerService.ts`.
- `staffSort.ts` util (espeja providers sort).
- Zod `staffSchema` en `lib/staff` o `lib/validations` (name, role?, hourlyRate≥0, active).
- Zod para minutos de asignación: entero ≥ 0 y **múltiplo de 30** (`minutes % 30 === 0`).
- Helpers puros `formatHHMM(minutes)` / `parseHHMM(h, m)` + `staffLineCost(rate, minutes)`.
- **Test (unit)**: schema valida; minutos rechaza no-múltiplos de 30; `formatHHMM`/`parseHHMM`
  ida y vuelta; `staffLineCost` (rate×min/60 redondeo). Ubicar helpers junto a su test.
- **DoD**: unit test verde.

### F3 — Financials

- Extender `EventLines` con `staff` + `EventFinancials.staffCost` + sumar a `totalCost`.
- Helper para derivar `effectiveMinutes`.
- Actualizar call sites (detalle, presupuesto, edit, reports).
- **Test (unit)**: `computeEventFinancials` con líneas de staff — staffCost suma a totalCost
  y a profit, NO altera subtotal/totalPrice. Caso `actualMinutes` pisa `estMinutes`.
- **DoD**: unit test verde, typecheck limpio.

### F4 — UI Personal (lista + form)

- Ruta `/personal` (route group dashboard): lista Server Component con filtros/sort/paginación
  usando la infraestructura existente (`SelectFilter`, pager). Tabla desktop + cards mobile.
- Form alta/edición (Client Component, RHF + Zod), control `h-9`, money via `formatMoney`.
- Server Actions create/update/delete + `revalidatePath`.
- Nav item con icono (lucide) en `components/dashboard/Sidebar.tsx`.
- `EmptyState` cuando no hay personal.
- **DoD**: CRUD funciona en navegador; responsive 390px y ≥1280px.

### F5 — Asignación en event form

- Picker de staff en `components/eventos/EventForm.tsx` (espeja picker de prestadores)
  con input de **horas estimadas** por empleado en formato **`hh:mm`**: `horas` (number) +
  `minutos` Select (`00`/`30`). Mostrar acumulado con `formatHHMM`.
- `createEventAction` / `updateEventAction` persisten `EventStaff` (estMinutes).
- Carga/edición de **horas reales** (`actualMinutes`) — en detalle del evento (post-evento).
- **DoD**: asignar staff con estimado y luego cargar real funciona end-to-end.

### F6 — Flag + display

- `staffPending` derivado en list service de eventos y en detalle.
- Badge "Falta registro de empleados" en lista de eventos + detalle, junto al estado de pago.
- **DoD**: badge aparece cuando hay staff sin `actualMinutes`, desaparece al cargar.

### F7 — Pago a staff

- Acción EGRESO contra cuenta + marca `paid`/`paidAt` por `EventStaff` (espeja pago prestadores
  en `app/(dashboard)/eventos/[id]/actions.ts`).
- Paga sobre `actualMinutes`.
- **DoD**: registrar pago crea movimiento EGRESO y marca pagado.

### F8 — Tests integración + e2e

- **Integration** (`tests/integration/`): `staffService` CRUD + filtros; financials con staff
  contra test DB. Factory `makeStaff` en `tests/integration/setup/db.ts` (money en cents).
- **E2E (Playwright)**: alta de staff → asignar a evento con horas estimadas → cargar horas
  reales → verificar costo/profit del evento + flag falta-registro → registrar pago.
- **DoD**: `npm test` pristine; e2e verde.

## 6. Definición de Done global (constitution §4.1)

- Unit: cálculos rate×min, financials con staff, schema Zod.
- Integration: staffService + financials contra test DB.
- E2E: flujo completo de usuario.
- `npm test` pristine + lint limpio antes de push.
- Branch feature, PR (merge gate con frase explícita).

## 7. Riesgos / notas

- No romper financials existentes: `staffCost` default 0 cuando no hay staff (eventos viejos).
- Mantener `computeEventFinancials` pura (sin Prisma) — derivar `effectiveMinutes` en el call site.
- Portabilidad SQLite→Postgres: solo Prisma, sin SQL crudo.
- Redondeo de cents en `round(rate × min / 60)`: definir y testear (banker's vs Math.round →
  usar `Math.round`, documentar).
