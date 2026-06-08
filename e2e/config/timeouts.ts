// Named timeouts/constants. No magic numbers in specs or page objects.
export const Timeouts = {
  /** Autosave round-trip (event edit pickers). */
  AUTOSAVE: 10_000,
  /** Navigation / redirect after a server action. */
  NAVIGATION: 15_000,
} as const;

// Seeded reference data the suite relies on (from prisma/seed.ts). Keep in sync
// with the seed; these are picker options, not test-created data.
export const Seeded = {
  CLIENT: "Familia García",
  EVENT_TYPE: "Cumpleaños",
  SERVICE: "Animación",
  ACCOUNT: "Caja",
} as const;
