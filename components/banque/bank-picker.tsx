"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, X, Library, Check, Download } from "lucide-react";
import {
  cloneExerciceForImport,
  TYPE_LABEL,
  EXERCICE_TYPES,
  type Exercice,
  type ExerciceType,
} from "@/lib/exercices/types";
import { searchBank, type BankItem } from "@/lib/banque/actions";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";

/** Modale de sélection d'exercices depuis la banque (§13.6). */
export function BankPicker({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (exs: Exercice[]) => void }) {
  const [items, setItems] = useState<BankItem[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    if (!open) return;
    startLoad(async () => {
      const rows = await searchBank({ q: query, type: typeFilter });
      setItems(rows);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, typeFilter]);

  if (!open) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function importSelection() {
    const exs = items.filter((it) => selected.has(it.id)).map((it) => cloneExerciceForImport(it.data));
    if (exs.length) onImport(exs);
    setSelected(new Set());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Fermer" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Library className="h-5 w-5 text-orange-500" /> Importer depuis la banque
          </h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-[var(--text-secondary)] hover:text-red-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-[var(--border-subtle)] p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher…" className={cn(inputClass, "pl-9")} />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(inputClass, "sm:w-48")}>
            <option value="">Tous les types</option>
            {EXERCICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-32 flex-1 overflow-y-auto p-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Aucune question dans la banque pour ce filtre.</p>
          ) : (
            <ul className="space-y-1.5">
              {items.map((it) => {
                const checked = selected.has(it.id);
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => toggle(it.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                        checked ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10" : "border-[var(--border-subtle)] hover:border-orange-300"
                      )}
                    >
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded border", checked ? "border-orange-500 bg-orange-500 text-white" : "border-[var(--border-subtle)]")}>
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                        {TYPE_LABEL[it.type as ExerciceType] ?? it.type}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{it.label}</span>
                        <span className="block truncate text-xs text-[var(--text-secondary)]">
                          {[it.discipline, it.theme].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-5 py-3">
          <span className="text-sm text-[var(--text-secondary)]">{selected.size} sélectionnée(s)</span>
          <button
            type="button"
            onClick={importSelection}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Importer la sélection
          </button>
        </div>
      </div>
    </div>
  );
}
