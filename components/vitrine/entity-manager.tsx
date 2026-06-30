"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date";
  placeholder?: string;
  required?: boolean;
  full?: boolean;
};

export type EntityItem = {
  id: string;
  published: boolean;
  /** Pré-calculé côté serveur (les fonctions ne traversent pas la frontière RSC). */
  primary: string;
  secondary?: string;
} & Record<string, unknown>;

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";

/** Gestionnaire CRUD générique d'une entité de contenu vitrine. */
export function EntityManager({
  items,
  fields,
  create,
  update,
  remove,
  toggle,
  addLabel = "Ajouter",
}: {
  items: EntityItem[];
  fields: FieldDef[];
  create: (fd: FormData) => Promise<void>;
  update: (id: string, fd: FormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  addLabel?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<EntityItem | "new" | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing && editing !== "new") await update(editing.id, fd);
      else await create(fd);
      setEditing(null);
      router.refresh();
    });
  }
  function act(fn: () => Promise<void>, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  const current = editing === "new" ? null : editing;

  return (
    <div className="space-y-3">
      {!editing && (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}

      {editing && (
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-orange-400 bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{editing === "new" ? "Nouvelle entrée" : "Modifier"}</h4>
            <button type="button" onClick={() => setEditing(null)} aria-label="Fermer" className="text-[var(--text-secondary)] hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.name} className={cn("space-y-1", f.full && "sm:col-span-2")}>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {f.label}
                  {f.required && <span className="text-orange-600"> *</span>}
                </span>
                {f.type === "textarea" ? (
                  <textarea
                    name={f.name}
                    required={f.required}
                    defaultValue={(current?.[f.name] as string) ?? ""}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2.5 text-sm outline-none focus:border-orange-500"
                  />
                ) : (
                  <input
                    name={f.name}
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    required={f.required}
                    defaultValue={(current?.[f.name] as string | number) ?? (f.type === "number" ? 0 : "")}
                    placeholder={f.placeholder}
                    className={inputClass}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold">
              Annuler
            </button>
            <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border-subtle)] p-6 text-center text-sm text-[var(--text-secondary)]">Aucune entrée.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const d = { primary: it.primary, secondary: it.secondary };
            return (
              <li
                key={it.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-[var(--bg-elevated)] p-3",
                  it.published ? "border-[var(--border-subtle)]" : "border-dashed border-[var(--border-subtle)] opacity-70"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.primary}</p>
                  {d.secondary && <p className="truncate text-xs text-[var(--text-secondary)]">{d.secondary}</p>}
                </div>
                {!it.published && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-500/10">Masqué</span>}
                <button type="button" disabled={pending} onClick={() => act(() => toggle(it.id))} aria-label={it.published ? "Masquer" : "Publier"} title={it.published ? "Masquer du site" : "Publier sur le site"} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-orange-400 hover:text-orange-600">
                  {it.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setEditing(it)} aria-label="Modifier" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-orange-400 hover:text-orange-600">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" disabled={pending} onClick={() => act(() => remove(it.id), `Supprimer « ${d.primary} » ?`)} aria-label="Supprimer" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] hover:border-red-300 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
