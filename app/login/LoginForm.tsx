"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";

const initialState = { error: undefined };

export function LoginForm() {
  const [state, action, isPending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      return loginAction(formData);
    },
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 font-medium">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
