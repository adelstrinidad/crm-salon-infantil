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

- **E2E with Playwright** for user flows (create event, record movement). As a QA, lead with these.
- Component tests with Vitest + React Testing Library where a component has real logic.
- Server-side/domain unit tests live in `lib/` (see backend constitution).

---

## IX. Anti-Patterns (Avoid)

- Overusing `"use client"` — turning server-renderable pages into client bundles
- Fetching initial data with `useEffect` instead of Server Components
- Adding TanStack Query / Zustand before there is a real client-state need
- Validating only on the client — always validate again in the Server Action
- Giant components mixing fetching, layout, and logic

---

**Related Documents**:
- [Architecture](./architecture.md) - System architecture and integration points
- [General Overview](./general-overview.md) - Project overview
- [Backend Constitution](./constitution-backend.md) - Server-side principles
