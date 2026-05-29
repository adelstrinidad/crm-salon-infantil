import { cn } from "@/lib/utils";

/**
 * Sign-colored monetary label. Replaces ad-hoc
 * `text-green-600` / `text-red-600` ternaries across finanzas, reportes,
 * eventos detail, and presupuesto.
 *
 * `signed`: when true, positive → success, negative → loss, zero → muted.
 * `tone`:    explicit override ("success" | "loss" | "muted" | "default").
 * `value`:   numeric value used to derive sign (when `signed`).
 * Children render the formatted text — `Money` only handles color.
 */
export function moneyToneClass(
  tone: "success" | "loss" | "muted" | "default",
): string {
  switch (tone) {
    case "success":
      return "text-success";
    case "loss":
      return "text-loss";
    case "muted":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

export function signTone(
  value: number,
  zero: "muted" | "success" = "muted",
): "success" | "loss" | "muted" {
  if (value > 0) return "success";
  if (value < 0) return "loss";
  return zero;
}

export function Money({
  value,
  signed = false,
  tone,
  className,
  children,
}: {
  value?: number;
  signed?: boolean;
  tone?: "success" | "loss" | "muted" | "default";
  className?: string;
  children: React.ReactNode;
}) {
  const resolvedTone: "success" | "loss" | "muted" | "default" =
    tone ?? (signed && typeof value === "number" ? signTone(value) : "default");
  return (
    <span className={cn(moneyToneClass(resolvedTone), className)}>
      {children}
    </span>
  );
}
