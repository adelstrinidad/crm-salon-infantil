"use client";

// Themed confirmation dialog — the in-app replacement for window.confirm().
// Native browser dialogs ("localhost:3000 says…") break the design language
// and can't be styled; every confirmation must go through this primitive
// (Frontend Constitution §X). Two flavors:
//   - <ConfirmDialog>: controlled, for flows whose trigger isn't a button
//     (e.g. calendar drag-and-drop).
//   - <ConfirmButton>: trigger + dialog + async action in one, for the common
//     "button asks before running a server action" case (deletes, closes).

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Render the confirm action in the destructive style (deletes, voids). */
  destructive?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4"
      >
        <SectionTitle>{title}</SectionTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3 pt-1">
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={destructive ? "destructive" : "default"}
            className="flex-1"
          >
            {loading ? "…" : confirmLabel}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1" autoFocus>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

type ConfirmButtonProps = {
  /** Trigger content (label, icon + label, …). */
  children: ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  /** Runs on confirm. Return { ok: false, error } to keep the dialog open with the message. */
  onConfirm: () => Promise<{ ok: boolean; error?: string } | void>;
  variant?: "default" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "xs" | "icon-sm";
  className?: string;
  "aria-label"?: string;
};

export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirm,
  variant = "destructive",
  size,
  className,
  "aria-label": ariaLabel,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const result = await onConfirm();
    setLoading(false);
    if (result && result.ok === false) {
      setError(result.error ?? "No se pudo completar la acción");
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        destructive={destructive}
        loading={loading}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => {
          setError(null);
          setOpen(false);
        }}
      />
    </>
  );
}
