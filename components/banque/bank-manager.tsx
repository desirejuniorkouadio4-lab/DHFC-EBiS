"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, X, Save, Library, FolderOpen, Folder, ChevronRight, GraduationCap } from "lucide-react";
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
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  // Accordéons : disciplines ouvertes par défaut, leçons fermées.
  const [openD, setOpenD] = useState<Set<string>>(() => new Set(items.map((it) => disciplineOf(it))));
  const [openC, setOpenC] = useState<Set<string>>(new Set());

  const filtered = items.filter(
    (it) =>
      (!typeFilter || it.type === typeFilter) &&
      (!query.trim() || it.label.toLowerCase().includes(query.trim().toLowerCase()))
  );

  // Arbre Discipline → Leçon (catégorie) → questions.
  const tree = useMemo(() => {
    const map = new Map<string, Map<string, BankItem[]>>();
    for (const it of filtered) {
      const d = disciplineOf(it);
      const c = it.category?.trim() || "Questions hors leçon";
      if (!map.has(d)) map.set(d, new Map());
      const cats = map.get(d)!;
      if (!cats.has(c)) cats.set(c, []);
      cats.get(c)!.push(it);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "fr"))
      .map(([discipline, cats]) => ({
        discipline,
        total: [...cats.values()].reduce((n, arr) => n + arr.length, 0),
        categories: [...cats.entries()]
          .sort((a, b) => a[0].localeCompare(b[0], "fr"))
          .map(([name, list]) => ({ name, items: list })),
      }));
  }, [filtered]);

  const forceOpen = !!query.trim() || !!typeFilter;
  const isOpenD = (d: string) => forceOpen || openD.has(d);
  const isOpenC = (key: string) => forceOpen || openC.has(key);
  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, key: string) => {
    const n = new Set(set);
    if (n.has(key)) n.delete(key);
    else n.add(key);
    setter(n);
  };

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

      {/* Arbre : Discipline → Leçon → Questions */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-10 text-center">
          <Library className="mx-auto h-7 w-7 text-[var(--text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {items.length === 0 ? "La banque est vide. Ajoutez une première question." : "Aucune question ne correspond au filtre."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tree.map((disc) => {
            const dOpen = isOpenD(disc.discipline);
            return (
              <div key={disc.discipline} className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                {/* Niveau 1 — Discipline */}
                <button
                  type="button"
                  onClick={() => toggle(openD, setOpenD, disc.discipline)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <ChevronRight className={cn("h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform", dOpen && "rotate-90")} />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{disc.discipline}</span>
                  <span className="shrink-0 rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                    {disc.total}
                  </span>
                </button>

                {/* Niveau 2 — Leçons (catégories) */}
                {dOpen && (
                  <div className="space-y-1 border-t border-[var(--border-subtle)] p-2">
                    {disc.categories.map((cat) => {
                      const key = `${disc.discipline}|${cat.name}`;
                      const cOpen = isOpenC(key);
                      return (
                        <div key={key} className="rounded-xl border border-[var(--border-subtle)]">
                          <button
                            type="button"
                            onClick={() => toggle(openC, setOpenC, key)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                          >
                            <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)] transition-transform", cOpen && "rotate-90")} />
                            {cOpen ? <FolderOpen className="h-4 w-4 shrink-0 text-orange-500" /> : <Folder className="h-4 w-4 shrink-0 text-orange-500" />}
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{shortCat(cat.name)}</span>
                            <span className="shrink-0 text-xs font-semibold text-[var(--text-secondary)]">{cat.items.length}</span>
                          </button>

                          {/* Niveau 3 — Questions */}
                          {cOpen && (
                            <ul className="space-y-1.5 border-t border-[var(--border-subtle)] p-2">
                              {cat.items.map((it) => (
                                <li key={it.id} className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2.5">
                                  <span className="inline-flex shrink-0 items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                                    {TYPE_LABEL[it.type as ExerciceType] ?? it.type}
                                  </span>
                                  <p className="min-w-0 flex-1 truncate text-sm">{it.label}</p>
                                  <button type="button" onClick={() => startEdit(it)} aria-label="Modifier" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-orange-400 hover:text-orange-600">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button type="button" onClick={() => remove(it.id)} aria-label="Supprimer" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-red-300 hover:text-red-600">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!draft && filtered.length > 0 && (
        <p className="text-xs text-[var(--text-secondary)]">
          <Plus className="mr-1 inline h-3.5 w-3.5" />
          {items.length} question{items.length > 1 ? "s" : ""} en banque — organisées par discipline puis par leçon, importables depuis n'importe quel quiz.
        </p>
      )}
    </div>
  );
}

/** Discipline d'une question (regroupement de niveau 1). */
function disciplineOf(it: BankItem): string {
  return it.discipline?.trim() || "Sans discipline";
}

/** Nom court d'une catégorie (retire le préfixe « Questions par défaut pour la Leçon : »). */
function shortCat(name: string): string {
  if (name === "Questions hors leçon") return name;
  return name.replace(/^Questions par défaut pour la Leçon\s*:\s*/i, "").trim() || name;
}
