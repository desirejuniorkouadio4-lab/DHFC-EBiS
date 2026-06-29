"use client";

import { useMemo, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "termine" | "inactif" | "en-difficulte" | "en-cours";

export type LearnerRow = {
  id: string;
  name: string;
  initials: string;
  college: string | null;
  region: string | null;
  progress: number;
  completedLessons: number;
  parcours: { title: string; short: string; color: string }[];
  lastActivityLabel: string;
  status: Status;
};

const STATUS_META: Record<Status, { label: string; className: string }> = {
  termine: { label: "Terminé", className: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300" },
  inactif: { label: "Inactif", className: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" },
  "en-difficulte": { label: "En difficulté", className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" },
  "en-cours": { label: "En cours", className: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]" },
};

export type Filter = "tous" | "inactif" | "en-difficulte" | "termine";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "inactif", label: "Inactifs" },
  { key: "en-difficulte", label: "En difficulté" },
  { key: "termine", label: "Terminés" },
];

export function CohortTable({ learners, initialFilter = "tous" }: { learners: LearnerRow[]; initialFilter?: Filter }) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return learners.filter((l) => {
      if (filter !== "tous" && l.status !== filter) return false;
      if (q && !l.name.toLowerCase().includes(q) && !(l.college ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [learners, filter, query]);

  const counts: Record<Filter, number> = {
    tous: learners.length,
    inactif: learners.filter((l) => l.status === "inactif").length,
    "en-difficulte": learners.filter((l) => l.status === "en-difficulte").length,
    termine: learners.filter((l) => l.status === "termine").length,
  };

  return (
    <div>
      {/* Filtres + recherche */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                filter === f.key
                  ? "bg-orange-500 text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {f.label} <span className="opacity-70">({counts[f.key]})</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un apprenant…"
            className="h-10 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] pl-9 pr-4 text-sm outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* En-tête table (desktop) */}
      <div className="mt-5 hidden grid-cols-[1.6fr_1.4fr_1fr_0.8fr_0.9fr] gap-3 border-b border-[var(--border-subtle)] px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] lg:grid">
        <span>Apprenant</span>
        <span>Parcours</span>
        <span>Avancement</span>
        <span>Dernière activité</span>
        <span>Statut</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">Aucun apprenant ne correspond.</p>
      ) : (
        <ul className="mt-2 space-y-2 lg:space-y-0">
          {rows.map((l) => (
            <li
              key={l.id}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border-subtle)] p-3 lg:grid-cols-[1.6fr_1.4fr_1fr_0.8fr_0.9fr] lg:items-center lg:rounded-none lg:border-0 lg:border-b lg:border-[var(--border-subtle)] lg:px-3 lg:py-3"
            >
              {/* Apprenant */}
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
                  {l.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{l.name}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{l.college ?? l.region ?? "—"}</p>
                </div>
              </div>

              {/* Parcours */}
              <div className="flex flex-wrap gap-1.5">
                {l.parcours.map((p, i) => (
                  <span
                    key={i}
                    title={p.title}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: `${p.color}1a`, color: p.color }}
                  >
                    {p.short}
                  </span>
                ))}
              </div>

              {/* Avancement */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500" style={{ width: `${l.progress}%` }} />
                </div>
                <span className="w-9 shrink-0 text-right text-xs font-bold text-orange-600">{l.progress}%</span>
              </div>

              {/* Dernière activité */}
              <div className="text-xs text-[var(--text-secondary)]">
                <span className="lg:hidden">Dernière activité : </span>
                {l.lastActivityLabel}
              </div>

              {/* Statut + action */}
              <div className="flex items-center justify-between gap-2 lg:justify-start">
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_META[l.status].className)}>
                  {STATUS_META[l.status].label}
                </span>
                <button
                  type="button"
                  aria-label={`Contacter ${l.name}`}
                  title="Contacter (bientôt disponible)"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600 lg:ml-1"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
