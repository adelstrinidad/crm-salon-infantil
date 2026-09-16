"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Secret input with a reveal toggle. Typing a password or a manager code blind
 * is the main source of "no coinciden" errors, so every secret field in the app
 * offers the eye — the user decides when it is safe to look.
 *
 * The toggle is a real button whose accessible name names its field ("Mostrar
 * Código actual"), so several secret fields on one form stay distinguishable —
 * for screen readers and for tests. It is out of the tab order, so keyboard
 * users are not forced through it between fields.
 */
function PasswordInput({
  className,
  secretLabel,
  ...props
}: React.ComponentProps<"input"> & { secretLabel: string }) {
  const [visible, setVisible] = React.useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={`${visible ? "Ocultar" : "Mostrar"} ${secretLabel}`}
        aria-pressed={visible}
        className="absolute right-0 top-0 flex h-9 w-10 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon className="size-4" />
      </button>
    </div>
  );
}

export { PasswordInput };
