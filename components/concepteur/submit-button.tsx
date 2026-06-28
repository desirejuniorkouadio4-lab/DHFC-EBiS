"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "subtle";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-orange-500 text-white shadow-brand hover:bg-orange-600 disabled:opacity-60",
  ghost:
    "border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-orange-400 disabled:opacity-60",
  subtle:
    "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-60",
};

/** Bouton de soumission générique avec état « en cours » (useFormStatus). */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        VARIANTS[variant],
        className
      )}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel ?? "…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Bouton carré icône seule (déplacer / supprimer) avec état « en cours ». */
export function IconSubmit({
  children,
  label,
  danger,
  disabled,
  className,
}: {
  children: React.ReactNode;
  label: string;
  danger?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label={label}
      title={label}
      disabled={pending || disabled}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors disabled:opacity-40",
        danger ? "hover:border-red-300 hover:text-red-600" : "hover:border-orange-400 hover:text-orange-600",
        className
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
