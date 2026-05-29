import { cn } from "@/lib/utils";

/**
 * Shared page-level title block.
 *
 * Every dashboard page should use this instead of hand-rolling
 * `<div className="flex items-center justify-between mb-6"><h1 .../></div>`
 * so spacing, weight and heading font stay in sync app-wide.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 mb-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}
