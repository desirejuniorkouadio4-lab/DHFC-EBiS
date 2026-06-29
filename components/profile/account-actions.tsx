"use client";

import { useState, useTransition } from "react";
import { KeyRound, Trash2, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { changePassword, deleteMyAccount } from "@/lib/profile/actions";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";

export function ChangePassword() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await changePassword(fd);
      setMsg(res.ok ? { ok: true, text: "Mot de passe mis à jour." } : { ok: false, text: res.error ?? "Échec." });
      if (res.ok) form.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="current" type="password" required placeholder="Mot de passe actuel" className={inputClass} autoComplete="current-password" />
        <input name="next" type="password" required minLength={8} placeholder="Nouveau mot de passe (8+ caractères)" className={inputClass} autoComplete="new-password" />
      </div>
      {msg && (
        <p className={cn("flex items-center gap-1.5 text-xs font-medium", msg.ok ? "text-green-600" : "text-red-600")}>
          {msg.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />} {msg.text}
        </p>
      )}
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Changer le mot de passe
      </button>
    </form>
  );
}

export function DeleteAccount() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-red-300 px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" /> Supprimer mon compte
      </button>
    );
  }

  return (
    <form action={deleteMyAccount} className="space-y-3 rounded-xl border border-red-300 bg-red-50 p-4 dark:bg-red-500/10">
      <p className="flex items-start gap-2 text-sm font-medium text-red-700 dark:text-red-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Cette action est <strong>irréversible</strong> : votre compte et toutes vos données (progression, certificats,
        messages, devoirs) seront définitivement supprimés.
      </p>
      <label className="block text-sm">
        <span className="text-[var(--text-secondary)]">
          Tapez <strong>SUPPRIMER</strong> pour confirmer :
        </span>
        <input name="confirm" required placeholder="SUPPRIMER" className={cn(inputClass, "mt-1")} autoComplete="off" />
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold">
          Annuler
        </button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700">
          <Trash2 className="h-4 w-4" /> Supprimer définitivement
        </button>
      </div>
    </form>
  );
}
