"use client";

import { UserPlus } from "lucide-react";
import { createUser } from "@/lib/admin/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";
import { ROLE_LABEL } from "@/lib/rbac";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";

/** Création manuelle d'un utilisateur (cohorte optionnelle). */
export function CreateUserForm({
  roleOptions,
  cohorts,
}: {
  roleOptions: string[];
  cohorts: { id: string; name: string }[];
}) {
  return (
    <details className="group min-w-0 flex-1">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-orange-600">
        <UserPlus className="h-4 w-4" /> Créer un utilisateur
      </summary>
      <form action={createUser} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="firstName" required placeholder="Prénom *" className={inputClass} />
          <input name="lastName" required placeholder="Nom *" className={inputClass} />
        </div>
        <input name="email" type="email" required placeholder="E-mail *" className={inputClass} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Rôle</span>
            <select name="role" defaultValue="APPRENANT" className={inputClass}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Cohorte (optionnel)</span>
            <select name="cohortId" defaultValue="" className={inputClass}>
              <option value="">Sans cohorte</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input name="bivalence" placeholder="Bivalence" className={inputClass} />
          <input name="region" placeholder="Région" className={inputClass} />
          <input name="dren" placeholder="DREN" className={inputClass} />
          <input name="college" placeholder="Collège" className={inputClass} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-secondary)]">
            Mot de passe temporaire : <strong>Bienvenue2026!</strong>. La cohorte inscrit aux parcours du groupe.
          </p>
          <SubmitButton pendingLabel="Création…" className="px-5">
            <UserPlus className="h-4 w-4" /> Créer
          </SubmitButton>
        </div>
      </form>
    </details>
  );
}
