"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Power, ShieldCheck, LogIn, Trash2, UserCheck, UserX, GraduationCap, Loader2 } from "lucide-react";
import { setUserRole, toggleUserActive, bulkSetActive, bulkSetRole, bulkEnrollCohort, bulkDeleteUsers } from "@/lib/admin/actions";
import { startImpersonation } from "@/lib/admin/impersonate";
import { IconSubmit } from "@/components/concepteur/submit-button";
import { ROLE_LABEL } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  region: string | null;
  college: string | null;
  active: boolean;
};

export function UsersTable({
  users,
  cohorts,
  roleOptions,
  actorId,
}: {
  users: Row[];
  cohorts: { id: string; name: string }[];
  roleOptions: string[];
  actorId: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState("");
  const [bulkCohort, setBulkCohort] = useState("");
  const [pending, startTransition] = useTransition();

  const selectable = users.filter((u) => u.id !== actorId);
  const allSelected = selectable.length > 0 && selectable.every((u) => selected.has(u.id));
  const ids = [...selected];

  function toggleOne(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectable.map((u) => u.id)));
  }
  function runBulk(action: () => Promise<void>, confirmMsg?: string) {
    if (ids.length === 0) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    startTransition(async () => {
      await action();
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {/* En-tête de sélection */}
      <div className="flex items-center gap-3 px-1 text-sm">
        <label className="flex cursor-pointer items-center gap-2 font-medium">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded accent-orange-500" />
          Tout sélectionner
        </label>
        {selected.size > 0 && (
          <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-[var(--text-secondary)] hover:text-orange-600">
            ({selected.size} sélectionné{selected.size > 1 ? "s" : ""} — désélectionner)
          </button>
        )}
      </div>

      {/* Barre d'actions par lot */}
      {selected.size > 0 && (
        <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-orange-300 bg-[var(--bg-elevated)] p-3 shadow-lg">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
            {pending && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <span className="mx-1 hidden h-5 w-px bg-[var(--border-subtle)] sm:block" />

          <button type="button" disabled={pending} onClick={() => runBulk(() => bulkSetActive(ids, true))} className={chip}>
            <UserCheck className="h-4 w-4" /> Activer
          </button>
          <button type="button" disabled={pending} onClick={() => runBulk(() => bulkSetActive(ids, false))} className={chip}>
            <UserX className="h-4 w-4" /> Désactiver
          </button>

          <span className="inline-flex items-center gap-1">
            <select value={bulkRole} onChange={(e) => setBulkRole(e.target.value)} className={selectClass}>
              <option value="">Rôle…</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <button type="button" disabled={pending || !bulkRole} onClick={() => runBulk(() => bulkSetRole(ids, bulkRole))} className={chip}>
              Appliquer
            </button>
          </span>

          {cohorts.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <select value={bulkCohort} onChange={(e) => setBulkCohort(e.target.value)} className={selectClass}>
                <option value="">Cohorte…</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button type="button" disabled={pending || !bulkCohort} onClick={() => runBulk(() => bulkEnrollCohort(ids, bulkCohort))} className={chip}>
                <GraduationCap className="h-4 w-4" /> Ajouter
              </button>
            </span>
          )}

          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk(() => bulkDeleteUsers(ids), `Supprimer définitivement ${ids.length} compte(s) ? Cette action est irréversible.`)}
            className={cn(chip, "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10")}
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        </div>
      )}

      {/* Liste */}
      <ul className="space-y-2">
        {users.map((u) => {
          const isSelf = u.id === actorId;
          const checked = selected.has(u.id);
          return (
            <li
              key={u.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border bg-[var(--bg-elevated)] p-4 lg:flex-row lg:items-center",
                checked ? "border-orange-400 ring-1 ring-orange-300" : "border-[var(--border-subtle)]"
              )}
            >
              {/* Sélection + identité */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isSelf}
                  onChange={() => toggleOne(u.id)}
                  aria-label={`Sélectionner ${u.name}`}
                  className="h-4 w-4 shrink-0 rounded accent-orange-500 disabled:opacity-30"
                />
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    u.active ? "bg-gradient-to-br from-orange-500 to-green-500" : "bg-neutral-400"
                  )}
                >
                  {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold">
                    {u.name}
                    {isSelf && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600 dark:bg-orange-500/10">Vous</span>}
                    {!u.active && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:bg-red-500/10">Désactivé</span>}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{u.email}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{u.college ?? u.region ?? "—"}</p>
                </div>
              </div>

              {/* Rôle */}
              {isSelf ? (
                <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] lg:self-auto">
                  <ShieldCheck className="h-4 w-4" /> {ROLE_LABEL[u.role]}
                </span>
              ) : (
                <form action={setUserRole.bind(null, u.id)} className="flex items-center gap-1.5 self-start lg:self-auto">
                  <select name="role" defaultValue={u.role} aria-label={`Rôle de ${u.name}`} className={selectClass}>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                  <IconSubmit label="Enregistrer le rôle">
                    <Check className="h-4 w-4" />
                  </IconSubmit>
                </form>
              )}

              {/* Actions individuelles */}
              {!isSelf && (
                <div className="flex items-center gap-1.5 self-start lg:self-auto">
                  {u.active && (
                    <form action={startImpersonation.bind(null, u.id)}>
                      <button type="submit" title={`Se connecter en tant que ${u.name}`} className={chip}>
                        <LogIn className="h-3.5 w-3.5" /> Se connecter
                      </button>
                    </form>
                  )}
                  <form action={toggleUserActive.bind(null, u.id)}>
                    <button
                      type="submit"
                      title={u.active ? "Désactiver le compte" : "Réactiver le compte"}
                      className={cn(
                        chip,
                        u.active ? "hover:border-red-300 hover:text-red-600" : "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"
                      )}
                    >
                      <Power className="h-3.5 w-3.5" /> {u.active ? "Désactiver" : "Réactiver"}
                    </button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const chip =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600 disabled:opacity-50";
const selectClass = "h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500";
