"use client";

import { useState } from "react";
import { Search, Lock, CheckSquare } from "lucide-react";
import {
  COMPLETION_CONDITIONS,
  CONDITION_LABEL,
  type CompletionRule,
  type AccessRule,
} from "@/lib/completion/types";
import type { LessonSibling } from "@/lib/concepteur/db";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";

/** Config concepteur : achèvement d'activité + restrictions d'accès (Moodle-like). */
export function CompletionAccessEditor({
  completion,
  setCompletion,
  access,
  setAccess,
  siblings,
}: {
  completion: CompletionRule;
  setCompletion: (r: CompletionRule) => void;
  access: AccessRule;
  setAccess: (r: AccessRule) => void;
  siblings: LessonSibling[];
}) {
  const [query, setQuery] = useState("");
  const selected = new Set(access.prerequisites);
  const filtered = siblings.filter((s) => !query.trim() || s.title.toLowerCase().includes(query.trim().toLowerCase()));

  function togglePrereq(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setAccess({ ...access, prerequisites: [...next] });
  }

  return (
    <div className="space-y-6">
      {/* ---------- Achèvement ---------- */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <CheckSquare className="h-4 w-4 text-orange-500" /> Suivi d'achèvement
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Comment cette activité est-elle considérée « achevée » ?</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(
            [
              { v: "none", label: "Désactivé", hint: "Aucun suivi" },
              { v: "manual", label: "Manuel", hint: "L'apprenant coche" },
              { v: "auto", label: "Automatique", hint: "Selon conditions" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setCompletion({ ...completion, mode: o.v })}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-colors",
                completion.mode === o.v
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                  : "border-[var(--border-subtle)] hover:border-orange-300"
              )}
            >
              <span className="block text-sm font-semibold">{o.label}</span>
              <span className="block text-xs text-[var(--text-secondary)]">{o.hint}</span>
            </button>
          ))}
        </div>

        {completion.mode === "auto" && (
          <div className="mt-4 space-y-2 rounded-xl border border-[var(--border-subtle)] p-3">
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Conditions à remplir (cumulables) — au moins « ouverture » par défaut :
            </p>
            {COMPLETION_CONDITIONS.map((cond) => (
              <label key={cond} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={completion[cond]}
                  onChange={(e) => setCompletion({ ...completion, [cond]: e.target.checked })}
                  className="h-4 w-4 rounded accent-orange-500"
                />
                {CONDITION_LABEL[cond]}
              </label>
            ))}
            {completion.pass && (
              <label className="mt-1 flex items-center gap-2 text-sm">
                Note de passage
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={completion.passScore}
                  onChange={(e) =>
                    setCompletion({ ...completion, passScore: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })
                  }
                  className="h-9 w-20 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500"
                />
                %
              </label>
            )}
          </div>
        )}
      </div>

      {/* ---------- Restrictions d'accès ---------- */}
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <Lock className="h-4 w-4 text-orange-500" /> Restriction d'accès
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Verrouille cette leçon tant que les activités prérequises ne sont pas achevées.
        </p>

        {siblings.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Aucune autre leçon dans ce parcours.</p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-[var(--text-secondary)]">Exiger</span>
                <select
                  value={access.requireAll ? "all" : "any"}
                  onChange={(e) => setAccess({ ...access, requireAll: e.target.value === "all" })}
                  className={cn(inputClass, "w-44")}
                >
                  <option value="all">toutes les activités</option>
                  <option value="any">au moins une</option>
                </select>
              </label>
              <span className="text-xs text-[var(--text-secondary)]">
                {selected.size} prérequis sélectionné{selected.size > 1 ? "s" : ""}
              </span>
            </div>

            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer les leçons…"
                className={cn(inputClass, "pl-9")}
              />
            </div>

            <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[var(--border-subtle)] p-2">
              {filtered.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--bg-secondary)]">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => togglePrereq(s.id)}
                      className="h-4 w-4 rounded accent-orange-500"
                    />
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    <span className="shrink-0 truncate text-xs text-[var(--text-secondary)]">{s.moduleTitle}</span>
                  </label>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-2 py-1.5 text-sm text-[var(--text-secondary)]">Aucun résultat.</li>}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
