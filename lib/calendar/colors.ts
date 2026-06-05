// Deterministic color assignment for event types.
// EventType has no color column (see prisma/schema.prisma), so we hash the
// type name into a curated soft palette aligned with the Sage & Clay theme.
// Same name → same color every render, no DB change required.

export type EventColor = { bg: string; text: string; border: string };

// 200-level fills + a defining border. The dashboard background is a pale warm
// cream (oklch 0.962), so 100-level pastels (e.g. the old #ffedd5 orange) washed
// out against it — these are saturated enough to read, with a border for edge.
const TYPE_PALETTE: EventColor[] = [
  { bg: "#bae6fd", text: "#075985", border: "#38bdf8" }, // sky
  { bg: "#bbf7d0", text: "#166534", border: "#4ade80" }, // green
  { bg: "#f5d0fe", text: "#86198f", border: "#e879f9" }, // fuchsia
  { bg: "#fde68a", text: "#854d0e", border: "#f59e0b" }, // amber
  { bg: "#fed7aa", text: "#9a3412", border: "#fb923c" }, // orange
  { bg: "#c7d2fe", text: "#3730a3", border: "#818cf8" }, // indigo
  { bg: "#99f6e4", text: "#115e59", border: "#2dd4bf" }, // teal
  { bg: "#fecdd3", text: "#9f1239", border: "#fb7185" }, // rose
];

// Small stable string hash (FNV-ish via *31). Deterministic across runs.
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function colorForEventType(type: string): EventColor {
  if (!type) return TYPE_PALETTE[0];
  return TYPE_PALETTE[hashString(type) % TYPE_PALETTE.length];
}

export const TYPE_PALETTE_SIZE = TYPE_PALETTE.length;
