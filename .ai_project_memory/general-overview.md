# crm-salon-infantil (CRM Salón Infantil) - Project Overview

**Project**: A CRM / management platform for children's party venues ("salones de fiestas infantiles") that centralizes event scheduling, accounting, inventory, staff, and client-facing digital invitations. Requirements modeled on the Bonete product (https://bonete.app/funcionalidades/).

## Executive Summary

crm-salon-infantil is a greenfield web application that helps a children's party-venue business run its day-to-day operations from a single place. Staff manage a calendar of sold and quoted events, build each event from a catalog of services and assigned staff (prestadores), apply complimentary services (bonificados), and quote (presupuestar) or reserve (reservar) it while the system computes cost, profit, and price. The platform tracks the venue's full accounting through financial accounts, balance, movements, and supplier/staff payments. Scope reference: the Bonete product (admin v0.6 observed at https://fiesta.bonete.app/admin).

**Key Facts**:
- **System**: CRM Salón Infantil
- **Current Phase**: Greenfield — initial development, no production code yet
- **Users**: Venue owners/administrators and staff (manage calendar, events, accounting, inventory, personnel); clients (view availability, share digital invitations); guests (confirm attendance, purchases)
- **Data Scale**: Small-to-medium business — hundreds to low thousands of events, clients, and inventory items per venue
- **Timeline**: To be defined

## Problem & Solution

**Problem**: Children's party venues juggle event bookings, budgets, staff assignment, supplier purchases, furniture, cash flow, and guest invitations across spreadsheets, messaging apps, and paper. This causes double-bookings, unclear payment and cash status, stock shortages, and manual invitation handling.

**Solution**: One platform that unifies the calendar, event details, accounting, inventory, furniture, staff scheduling, sales, reporting, and client-facing digital invitations — giving the venue a single source of truth and reducing scheduling, billing, and stock errors.

See [Architecture](./architecture.md) for system architecture.

## System Components

### Implemented (observed in admin v0.6)

1. **Calendar** - Day/week/month/year/list calendar of events, color-coded by **event state**: Reservado, Señado (deposit paid), Pagado, Cerrado, Suspendido, Presupuestado (quoted), Día festivo (holiday).
2. **Event Management** - Per-event record with: name, **event type** (tipo de evento), **client**, start/end datetime, rich-text details and notes, **services** (servicios) offered, **providers/staff** (prestadores/empleados) assigned, **complimentary services** (bonificados), and an auto-computed financial summary (Costo total, Ganancia total, Precio sin bonificaciones, Total bonificado, Subtotal, Precio total). Events split into **Mis eventos** (sold) and **Presupuestados** (quotes); actions are **Presupuestar** (quote) and **Reservar** (reserve).
3. **Clients** - Client records, created inline from the event form or managed separately.
4. **Services catalog** - Services that can be offered on events (with cost/price feeding the event summary).
5. **Providers / Staff (Prestadores)** - Employees/providers assignable to events.
6. **Finance (Finanzas)** - **Cuentas** (financial accounts), **Balance**, and **Reportes** (report hub, event report, services report, reports not linked to events).
7. **Movements (Movimientos)** - Financial movements with categories **Ingreso, Egreso, Transferencia, Arqueo, Inversión, Retiros**; includes **Pago proveedores** (supplier payments) and **Pago prestadores** (staff payments).
8. **Reports & Analytics** - Income/expense, performance by event or service, and movements not tied to events.

### Roadmap / marketed (on public site, not in admin v0.6)

1. **Digital Invitations** - Customizable, interactive digital cards shared with guests, with attendance confirmation (RSVP).
2. **Inventory & Supplies** - Stock control, supply registration, supplier purchasing, low-stock alerts.
3. **Furniture & Equipment** - Furniture inventory, predefined packages, auto-assignment to events.
4. **Sales (client vs guest)** - Charges for supplies/products differentiating clients vs guests, discounts, digital receipts.

## Key Integration Points

- **Payment / Charging**: Per-event and movement charging/receipts; supplier and staff payouts. Payment gateway integration to be selected.
- **Notifications (Email / WhatsApp)**: Booking and availability communication (Bonete uses WhatsApp as a primary channel).
- **Shareable Invitation Links** (roadmap): Public links for digital invitations and guest attendance confirmation.

## Documentation Structure

- **Architecture**: `./architecture.md` — system components, integrations, data flow
- **Constitution**: `./constitution.md` — universal development principles
- **Frontend Constitution**: `./constitution-frontend.md` — FE stack, commands, patterns
- **Backend Constitution**: `./constitution-backend.md` — BE stack, commands, patterns

---
