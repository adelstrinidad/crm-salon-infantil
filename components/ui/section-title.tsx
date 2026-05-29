import { cn } from "@/lib/utils";

/**
 * Section-level heading (h2) used inside a page or card.
 * Single typographic style so reportes / finanzas / event-detail stop drifting.
 */
export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-heading text-lg font-medium tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}
