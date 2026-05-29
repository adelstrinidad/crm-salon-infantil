import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A native <select> styled to match the design system (same chrome as the
 * shadcn Select trigger), with a custom chevron. Because it is a real <select>
 * it still submits inside plain `method="GET"` forms and works with
 * react-hook-form's `register()` — unlike the Radix Select. Use this anywhere
 * a raw `<select>` was used.
 */
function NativeSelect({
  className,
  containerClassName,
  children,
  ...props
}: React.ComponentProps<"select"> & { containerClassName?: string }) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <select
        data-slot="native-select"
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-input bg-card px-3 pr-9 text-sm text-foreground transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export { NativeSelect };
