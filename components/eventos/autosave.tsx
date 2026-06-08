"use client";

// Page-wide autosave status for the event edit page. Every saver (the header
// form fields and each line picker) wraps its mutation in `run()`, which drives
// a single global indicator ("Guardando…" → "Guardado ✓"). There is no manual
// "Guardar" button on the edit page — this tells the user their changes persist.

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type AutosaveContextValue = {
  status: AutosaveStatus;
  // Wrap any save. If the result is an action object with `ok: false`, the
  // status becomes "error"; a thrown error also marks "error" (and re-throws).
  run: <T>(fn: () => Promise<T>) => Promise<T>;
};

// Default no-op so components shared with the create page (no provider) still
// work: run() just executes the function and status stays idle.
const NOOP: AutosaveContextValue = {
  status: "idle",
  run: (fn) => fn(),
};

const AutosaveContext = createContext<AutosaveContextValue | null>(null);

export function useAutosave(): AutosaveContextValue {
  return useContext(AutosaveContext) ?? NOOP;
}

export function AutosaveProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  // Guards against out-of-order saves: only the latest run updates the status.
  const seq = useRef(0);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    const id = ++seq.current;
    setStatus("saving");
    try {
      const res = await fn();
      const failed =
        !!res &&
        typeof res === "object" &&
        "ok" in (res as Record<string, unknown>) &&
        (res as { ok?: boolean }).ok === false;
      if (id === seq.current) setStatus(failed ? "error" : "saved");
      return res;
    } catch (err) {
      if (id === seq.current) setStatus("error");
      throw err;
    }
  }, []);

  return (
    <AutosaveContext.Provider value={{ status, run }}>{children}</AutosaveContext.Provider>
  );
}

export function AutosaveIndicator({ className }: { className?: string }) {
  const { status } = useAutosave();

  const content = {
    idle: {
      icon: <Check className="size-4" />,
      text: "Se guarda automáticamente",
      tone: "text-muted-foreground",
    },
    saving: {
      icon: <Loader2 className="size-4 animate-spin" />,
      text: "Guardando…",
      tone: "text-muted-foreground",
    },
    saved: {
      icon: <Check className="size-4" />,
      text: "Guardado",
      tone: "text-success",
    },
    error: {
      icon: <TriangleAlert className="size-4" />,
      text: "No se pudo guardar",
      tone: "text-destructive",
    },
  }[status];

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium", content.tone, className)}
    >
      {content.icon}
      {content.text}
    </span>
  );
}
