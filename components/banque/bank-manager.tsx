"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, X, Save, Library, FolderOpen } from "lucide-react";
import {
  createExercice,
  TYPE_LABEL,
  EXERCICE_TYPES,
  type Exercice,
  type ExerciceType,
} from "@/lib/exercices/types";
import { ExerciceConfig } from "@/components/exercices/builder";
import { saveToBank, updateBankQuestion, deleteBankQuestion, type BankItem } from "@/lib/banque/actions";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";

type Draft = { id: string | null; ex: Exercice; discipline: string; theme: string };

export function BankManager({ initialItems, blobEnabled }: { initialItems: BankItem[]; blobEnabled: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();

  const categories = [...new Set(items.map((it) => it.category).filter((c): c is string => !!c))].sort();
  const filtered = items.filter(
    (it) =>
      (!typeFilter || it.type === typeFilter) &&
      (!categoryFilter || it.category === categoryFilter) &&
      (!query.trim() || it.label.toLowerCase().includes(query.trim().toLowerCase()))
  );

  function startNew(type: ExerciceType) {
    setDraft({ id: null, ex: createExercice(type), discipline: "", theme: "" });
  }
  function startEdit(it: BankItem) {
    setDraft({ id: it.id, ex: it.data, discipline: it.discipline ?? "", theme: it.theme ?? "" });
  }

  function save() {
    if (!draft) return;
    const { id, ex, discipline, theme } = draft;
    startTransition(async () => {
      if (id) await updateBankQuestion(id, ex, { discipline, theme });
      else await saveToBank(ex, { discipline, theme });
      setDraft(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    startTransition(async () => {
      await deleteBankQuestion(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une question…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={cn(inputClass, "sm:w-64")}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(inputClass, "sm:w-52")}>
          <option value="">Tous les types</option>
          {EXERCICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Création */}
      {!draft && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-[var(--border-subtle)] p-3">
          <span className="text-sm font-medium">Nouvelle question :</span>
          <select
            onChange={(e) => {
              if (e.target.value) startNew(e.target.value as ExerciceType);
              e.target.value = "";
            }}
            defaultValue=""
            className={cn(inputClass, "sm:w-56")}
          >
            <option value="" disabled>
              Choisir un type…
            </option>
            {EXERCICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Éditeur */}
      {draft && (
        <div className="space-y-4 rounded-2xl border border-orange-400 bg-[var(--bg-elevated)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {draft.id ? "Modifier" : "Nouvelle"} — {TYPE_LABEL[draft.ex.type]}
            </h3>
            <button type="button" onClick={() => setDraft(null)} aria-label="Fermer" className="text-[var(--text-secondary)] hover:text-red-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <input
            value={draft.ex.prompt}
            onChange={(e) => setDraft({ ...draft, ex: { ...draft.ex, prompt: e.target.value } })}
            placeholder="Énoncé de la question"
            className={cn(inputClass, "font-medium")}
          />
          <ExerciceConfig ex={draft.ex} onUpdate={(ex) => setDraft({ ...draft, ex })} blobEnabled={blobEnabled} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={draft.discipline}
              onChange={(e) => setDraft({ ...draft, discipline: e.target.value })}
              placeholder="Discipline (ex. Physique-Chimie)"
              className={inputClass}
            />
            <input
              value={draft.theme}
              onChange={(e) => setDraft({ ...draft, theme: e.target.value })}
              placeholder="Thème (ex. Énergie)"
              className={inputClass}
            />
          </div>
          <input
            value={draft.ex.feedback ?? ""}
            onChange={(e) => setDraft({ ...draft, ex: { ...draft.ex, feedback: e.target.value } })}
            placeholder="Feedback (optionnel)"
            className={cn(inputClass, "text-[var(--text-secondary)]")}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold">
              Annuler
            </button>
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-10 text-center">
          <Library className="mx-auto h-7 w-7 text-[var(--text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {items.length === 0 ? "La banque est vide. Ajoutez une première question." : "Aucune question ne correspond au filtre."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
              <span className="inline-flex shrink-0 items-center rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                {TYPE_LABEL[it.type as ExerciceType] ?? it.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{it.label}</p>
                {it.category ? (
                  <p className="flex items-center gap-1.5 truncate text-xs text-[var(--text-secondary)]">
                    <FolderOpen className="h-3 w-3 shrink-0 text-orange-500" />
                    <span className="truncate">{it.category}</span>
                    {it.discipline && <span className="shrink-0 opacity-70">· {it.discipline}</span>}
                  </p>
                ) : (
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {[it.discipline, it.theme].filter(Boolean).join(" · ") || "Sans catégorie"}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => startEdit(it)} aria-label="Modifier" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-orange-400 hover:text-orange-600">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => remove(it.id)} aria-label="Supprimer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-red-300 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!draft && filtered.length > 0 && (
        <p className="text-xs text-[var(--text-secondary)]">
          <Plus className="mr-1 inline h-3.5 w-3.5" />
          {items.length} question{items.length > 1 ? "s" : ""} en banque — importables depuis n'importe quel quiz.
        </p>
      )}
    </div>
  );
}
