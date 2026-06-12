# crm-salon-infantil Frontend Development Constitution

**Purpose**: Self-contained frontend guide — tech stack, commands, patterns, standards. Same Next.js app as the server-side (see [Backend Constitution](./constitution-backend.md)).

> Greenfield, beginner-friendly. Start with the smallest set of tools; add libraries only when a real need appears.

---

## I. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js (App Router) | 16.x | React framework, SSR + Server Components |
| **Language** | TypeScript | 5.x | UI language (strict mode) |
| **React** | React | 19.x | Server + Client Components |
| **UI rendering** | React Server Components + Client Components | - | Server-first; `"use client"` only when interactive |
| **Styling** | Tailwind CSS | 4.x | Utility CSS (`@tailwindcss/postcss`) |
| **Components** | shadcn/ui (Radix) | - | Accessible component primitives, copy-in (`components/ui/`) |
| **Forms** | React Hook Form + Zod | - | Form state + shared validation with server |
| **Server state** | Server Components + Server Actions | - | Default data path — no client cache library yet |
| **Build** | Next.js / Turbopack | - | Dev server + build |
| **E2E Testing** | Playwright | - | End-to-end tests |

**Add later only if needed**: TanStack Query (when heavy client-side fetching/caching appears), Zustand (when cross-component client state grows). Not used initially — Server Components + Server Actions cover the dashboard.

<!-- manual additions start -->
<!-- manual additions end -->

---

## II. Commands

```bash
# Dev server
npm run dev

# Production build
npm run build

# Lint
npm run lint

# E2E tests
npm run test:e2e
```

---

## III. Code Structure

```
app/                         # App Router (routes = folders)
├── (dashboard)/             # Staff dashboard route group
│   ├── layout.tsx           # Shared nav/shell
│   ├── eventos/
│   │   ├── page.tsx         # Server Component: event list
│   │   ├── nuevo/page.tsx   # Event create form (Client Component)
│   │   └── actions.ts       # Server Actions for mutations
│   ├── calendario/
│   └── finanzas/
├── globals.css              # Tailwind entry
└── layout.tsx               # Root layout
components/
├── ui/                      # shadcn/ui primitives
└── <feature>/               # Feature components (event-form, calendar, ...)
lib/                         # Shared logic + types (see backend constitution)
```

---

## IV. UI Patterns

- **Server Components by default**: pages fetch data server-side via `lib/`; mark a component `"use client"` only when it needs state, effects, or event handlers.
- **Mutations via Server Actions**: forms call a Server Action; on success, revalidate the route (`revalidatePath`) so the list refreshes — no manual cache management.
- **Forms**: React Hook Form for UX, the **same Zod schema** validates on client and inside the Server Action.
- **Composition over config**: build screens from small components on top of shadcn/ui primitives.
- **Keep the client boundary low**: push `"use client"` to the leaf that needs it, not the whole page.

---

## V. State Management

- **Server state**: lives on the server; read in Server Components, mutate via Server Actions, refresh via `revalidatePath`/`revalidateTag`.
- **URL state**: filters, tabs, selected date → Next.js route params and `searchParams`.
- **Local UI state**: `useState` within a Client Component.
- Only reach for TanStack Query / Zustand when the above genuinely stops scaling.

---

## VI. Code Quality

- **TypeScript strict mode** on; no `any` without a written reason.
- **Feature-based folders**: group a feature's components together.
- Keep components focused — split when one file mixes data fetching, layout, and complex logic.
- ESLint + Prettier enforce formatting.

---

## VII. Accessibility

- WCAG 2.1 AA target; shadcn/ui + Radix give accessible primitives — keep their semantics.
- Semantic HTML, keyboard navigation, screen-reader labels on icon-only buttons.

---

## VIII. Testing

**Tests ship with the feature, before push** — see Constitution §4.1 (Definition of Done).

- **E2E with Playwright** for every new user flow (create event, record movement). As a QA, lead with these.
- Component tests with Vitest + React Testing Library where a component has real logic.
- Server-side/domain unit + integration tests live in `lib/` and `tests/integration/` (see backend constitution §VIII).
- `npm test` must pass with pristine output before pushing.

---

## IX. Anti-Patterns (Avoid)

- Overusing `"use client"` — turning server-renderable pages into client bundles
- Fetching initial data with `useEffect` instead of Server Components
- Adding TanStack Query / Zustand before there is a real client-state need
- Validating only on the client — always validate again in the Server Action
- Giant components mixing fetching, layout, and logic
- **Native `<select>` for in-app dropdowns** — the option list is OS-rendered and unstyleable; use the shadcn `Select` (see §X)
- **Fixed full-width sidebar with no mobile fallback** — always provide the drawer pattern (see §X)
- Raw `<input>` / `<select>` with ad-hoc classes instead of the `ui/` primitives — heights/borders drift and rows misalign
- **`window.confirm()` / `window.alert()` / `window.prompt()`** — native browser dialogs ("localhost:3000 says…") ignore the design system entirely; use `ConfirmDialog`/`ConfirmButton` and inline notices (see §X)

---

## X. Design System & Responsive UI

Greenfield design language: warm "Sage & Clay" Montessori palette (tokens in `app/globals.css`), minimalist but intentional. Build from `components/ui/` primitives — never hand-roll control chrome.

### Controls (consistency is non-negotiable)
- **One control height: `h-9`.** `Input`, `Select` trigger, `NativeSelect`, date inputs, and the **default `Button`** are all `h-9` so they align in a row. Don't reintroduce `h-8`.
- **Dropdowns — pick by context:**
  - **In-app forms** (create/edit, pickers, modals) → shadcn **`Select`** (Radix). Styled popover + themed options. With react-hook-form, drive it with `setValue` + a hidden `register` input; pass an **`items` map** to `Select` so the trigger shows the *label*, not the raw value/id.
  - **GET filter forms** (list-page filters) → **`SelectFilter`** (`components/ui/select-filter.tsx`): a Radix Select + hidden input so the browser still submits. Uses an `__all__` sentinel for the "Todas/Todos" (no-filter) option since Radix forbids empty values.
  - Plain `NativeSelect` only when an empty-string option is required (e.g. "Sin proveedor") and a JS popover isn't worth it.
- **Hidden inputs** (RHF/GET) must be wrapped with their control in a single `<div>` — never left as a bare `space-y` sibling, or they add a phantom 4px gap that misaligns the field.
- Inputs/selects use `bg-card`; money via `formatMoney` (cents — see backend constitution).

### Modals & confirmations (one dialog language)
- **Never native dialogs**: `window.confirm/alert/prompt` are banned — they render browser chrome ("localhost:3000 says…") outside the theme.
- **Confirmations** → `components/ui/confirm-dialog.tsx`:
  - `ConfirmButton` for the common "button asks before a server action" case (deletes, closes). Pass the action as `onConfirm`; returning `{ ok: false, error }` keeps the dialog open showing the error.
  - `ConfirmDialog` (controlled) when the trigger isn't a button (e.g. calendar drag-and-drop confirmation).
  - Destructive confirmations pass `destructive` so the confirm button uses the destructive style; cancel is always "Cancelar".
  - The confirm label must NOT duplicate the trigger label when both can be on screen at once (trigger "Cerrar consumos" → confirm "Sí, cerrar") — keeps role-based locators unambiguous.
- **Custom modals** (forms inside a dialog: cobros, anulación, merma) share the same shell: `fixed inset-0 z-50 bg-black/40` overlay + `bg-card rounded-xl shadow-xl w-full max-w-md p-6` panel, `SectionTitle` header with an `aria-label="Cerrar"` × button, actions row of two `flex-1` buttons (primary first, "Cancelar" outline second).
- **Error notices** → inline `text-destructive` text or a dismissable `bg-destructive/10` banner — never `window.alert`.

### Layout & responsiveness (mobile must work)
- **Responsive shell**: persistent sidebar `hidden lg:flex`; below `lg` a top bar + hamburger opens a slide-over drawer (`components/dashboard/Sidebar.tsx`). `main` is `min-w-0` + `p-4 sm:p-6 lg:p-8` so tables scroll instead of overflowing.
- **Form rows stack on mobile**: `grid-cols-1 sm:grid-cols-2`, never bare `grid-cols-2`.
- **Lists**: desktop table (`hidden md:block`) + mobile card list (`md:hidden`) for the heavy lists (events, movements, payments).
- Root `app/layout.tsx`: `lang="es"` + a `viewport` export.

### Texture (so it doesn't read as "empty / 90s")
- **Icons** (lucide) in nav items, primary buttons (`+ Nuevo` → `Plus`), and empty states.
- **Empty states** use `EmptyState` (`components/ui/empty-state.tsx`): icon-in-tinted-circle + title + description + CTA — never a bare "No hay…" line.
- Keep secondary text contrast ≥ WCAG AA (avoid `/50` opacity on small labels).

### Verify before shipping UI
- Drive the running app with Playwright at **390px and ≥1280px**; for alignment doubts, measure `getBoundingClientRect()` rather than eyeballing.

---

**Related Documents**:
- [Architecture](./architecture.md) - System architecture and integration points
- [General Overview](./general-overview.md) - Project overview
- [Backend Constitution](./constitution-backend.md) - Server-side principles
