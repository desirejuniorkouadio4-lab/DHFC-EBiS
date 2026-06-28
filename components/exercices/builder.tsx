"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import {
  createExercice,
  uid,
  EXERCICE_TYPES,
  TYPE_LABEL,
  TYPE_HINT,
  type Exercice,
  type ExerciceType,
  type Blank,
  type QuizContent,
} from "@/lib/exercices/types";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";
const smallInput =
  "h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500";

/** Builder d'un quiz : suite d'exercices auto-corrigés (concepteur). */
export function ExercicesBuilder({ value, onChange }: { value: QuizContent; onChange: (v: QuizContent) => void }) {
  const [newType, setNewType] = useState<ExerciceType>("QCU");

  const patch = (p: Partial<QuizContent>) => onChange({ ...value, ...p });
  const updateEx = (updated: Exercice) =>
    patch({ exercices: value.exercices.map((e) => (e.id === updated.id ? updated : e)) });
  const removeEx = (id: string) => patch({ exercices: value.exercices.filter((e) => e.id !== id) });
  const moveEx = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= value.exercices.length) return;
    const next = [...value.exercices];
    [next[idx], next[j]] = [next[j], next[idx]];
    patch({ exercices: next });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Consigne générale</label>
          <textarea
            value={value.intro}
            onChange={(e) => patch({ intro: e.target.value })}
            rows={2}
            placeholder="Validez vos acquis sur ce module."
            className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-orange-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Seuil de réussite</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={value.passScore}
              onChange={(e) => patch({ passScore: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
              className={cn(inputClass, "w-24")}
            />
            <span className="text-sm text-[var(--text-secondary)]">%</span>
          </div>
        </div>
      </div>

      {value.exercices.length === 0 && (
        <p className="rounded-xl border border-dashed border-[var(--border-subtle)] p-6 text-center text-sm text-[var(--text-secondary)]">
          Aucun exercice. Choisissez un type et ajoutez-en un.
        </p>
      )}

      {value.exercices.map((ex, i) => (
        <article key={ex.id} className="rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
              {i + 1}. {TYPE_LABEL[ex.type]}
            </span>
            <div className="flex items-center gap-1">
              <label className="mr-1 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                Points
                <input
                  type="number"
                  min={1}
                  value={ex.points}
                  onChange={(e) => updateEx({ ...ex, points: Math.max(1, Number(e.target.value) || 1) })}
                  className={cn(smallInput, "w-14")}
                />
              </label>
              <IconBtn label="Monter" onClick={() => moveEx(i, -1)} disabled={i === 0}>
                <ArrowUp className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Descendre" onClick={() => moveEx(i, 1)} disabled={i === value.exercices.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Supprimer" danger onClick={() => removeEx(ex.id)}>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          </div>

          <input
            value={ex.prompt}
            onChange={(e) => updateEx({ ...ex, prompt: e.target.value })}
            placeholder="Énoncé de l'exercice"
            className={cn(inputClass, "mt-3 font-medium")}
          />

          <div className="mt-3">
            <ExerciceConfig ex={ex} onUpdate={updateEx} />
          </div>

          <input
            value={ex.feedback ?? ""}
            onChange={(e) => updateEx({ ...ex, feedback: e.target.value })}
            placeholder="Feedback affiché après réponse (optionnel)"
            className={cn(inputClass, "mt-3 text-[var(--text-secondary)]")}
          />
        </article>
      ))}

      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-[var(--border-subtle)] p-3 sm:flex-row sm:items-center">
        <select value={newType} onChange={(e) => setNewType(e.target.value as ExerciceType)} className={cn(inputClass, "sm:w-56")}>
          {EXERCICE_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <p className="min-w-0 flex-1 text-xs text-[var(--text-secondary)]">{TYPE_HINT[newType]}</p>
        <button
          type="button"
          onClick={() => patch({ exercices: [...value.exercices, createExercice(newType)] })}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>
    </div>
  );
}

function IconBtn({ children, label, danger, disabled, onClick }: { children: React.ReactNode; label: string; danger?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors disabled:opacity-30",
        danger ? "hover:border-red-300 hover:text-red-600" : "hover:border-orange-400 hover:text-orange-600"
      )}
    >
      {children}
    </button>
  );
}

/* ============================================================
 *  Configurateurs par type
 * ============================================================ */
function ExerciceConfig({ ex, onUpdate }: { ex: Exercice; onUpdate: (e: Exercice) => void }) {
  switch (ex.type) {
    case "QCU":
      return <QCUConfig ex={ex} onUpdate={onUpdate} />;
    case "QCM":
      return <QCMConfig ex={ex} onUpdate={onUpdate} />;
    case "VRAI_FAUX":
      return <VraiFauxConfig ex={ex} onUpdate={onUpdate} />;
    case "REPONSE_COURTE":
      return <ReponseCourteConfig ex={ex} onUpdate={onUpdate} />;
    case "TEXTE_A_TROUS":
      return <TexteATrousConfig ex={ex} onUpdate={onUpdate} />;
    case "ORDONNANCEMENT":
      return <OrdonnancementConfig ex={ex} onUpdate={onUpdate} />;
    case "APPARIEMENT":
      return <AppariementConfig ex={ex} onUpdate={onUpdate} />;
    case "CALCUL":
      return <CalculConfig ex={ex} onUpdate={onUpdate} />;
    case "REPONSE_LONGUE":
      return <ReponseLongueConfig ex={ex} onUpdate={onUpdate} />;
  }
}

type Cfg<T extends Exercice> = { ex: T; onUpdate: (e: Exercice) => void };

function QCUConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "QCU" }>>) {
  const setOpt = (id: string, text: string) =>
    onUpdate({ ...ex, data: { ...ex.data, options: ex.data.options.map((o) => (o.id === id ? { ...o, text } : o)) } });
  const add = () => onUpdate({ ...ex, data: { ...ex.data, options: [...ex.data.options, { id: uid("o"), text: "" }] } });
  const remove = (id: string) =>
    onUpdate({
      ...ex,
      data: { ...ex.data, options: ex.data.options.filter((o) => o.id !== id) },
      correctAnswer: ex.correctAnswer === id ? "" : ex.correctAnswer,
    });
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--text-secondary)]">Cochez la bonne réponse :</p>
      {ex.data.options.map((o) => (
        <div key={o.id} className="flex items-center gap-2">
          <input type="radio" name={`c-${ex.id}`} checked={ex.correctAnswer === o.id} onChange={() => onUpdate({ ...ex, correctAnswer: o.id })} className="h-4 w-4 accent-green-500" />
          <input value={o.text} onChange={(e) => setOpt(o.id, e.target.value)} placeholder="Texte de l'option" className={inputClass} />
          <IconBtn label="Supprimer l'option" danger onClick={() => remove(o.id)}>
            <Trash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ))}
      <AddRow label="Ajouter une option" onClick={add} />
    </div>
  );
}

function QCMConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "QCM" }>>) {
  const right = new Set(ex.correctAnswer);
  const toggle = (id: string) => {
    const n = new Set(right);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    onUpdate({ ...ex, correctAnswer: [...n] });
  };
  const setOpt = (id: string, text: string) =>
    onUpdate({ ...ex, data: { ...ex.data, options: ex.data.options.map((o) => (o.id === id ? { ...o, text } : o)) } });
  const add = () => onUpdate({ ...ex, data: { ...ex.data, options: [...ex.data.options, { id: uid("o"), text: "" }] } });
  const remove = (id: string) =>
    onUpdate({ ...ex, data: { ...ex.data, options: ex.data.options.filter((o) => o.id !== id) }, correctAnswer: ex.correctAnswer.filter((c) => c !== id) });
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--text-secondary)]">Cochez les bonnes réponses :</p>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          Notation
          <select
            value={ex.data.scoring}
            onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, scoring: e.target.value as "all" | "partial" } })}
            className={smallInput}
          >
            <option value="partial">Partielle</option>
            <option value="all">Tout ou rien</option>
          </select>
        </label>
      </div>
      {ex.data.options.map((o) => (
        <div key={o.id} className="flex items-center gap-2">
          <input type="checkbox" checked={right.has(o.id)} onChange={() => toggle(o.id)} className="h-4 w-4 rounded accent-green-500" />
          <input value={o.text} onChange={(e) => setOpt(o.id, e.target.value)} placeholder="Texte de l'option" className={inputClass} />
          <IconBtn label="Supprimer l'option" danger onClick={() => remove(o.id)}>
            <Trash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ))}
      <AddRow label="Ajouter une option" onClick={add} />
    </div>
  );
}

function VraiFauxConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "VRAI_FAUX" }>>) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs font-medium text-[var(--text-secondary)]">Bonne réponse :</p>
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onUpdate({ ...ex, correctAnswer: v })}
          className={cn(
            "h-9 rounded-lg border px-4 text-sm font-semibold transition-colors",
            ex.correctAnswer === v ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-500/10" : "border-[var(--border-subtle)] text-[var(--text-secondary)]"
          )}
        >
          {v ? "Vrai" : "Faux"}
        </button>
      ))}
    </div>
  );
}

function ReponseCourteConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "REPONSE_COURTE" }>>) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[var(--text-secondary)]">Réponses acceptées (une par ligne)</label>
      <textarea
        value={ex.correctAnswer.join("\n")}
        onChange={(e) => onUpdate({ ...ex, correctAnswer: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
        rows={3}
        placeholder={"photosynthèse\nla photosynthèse"}
        className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-orange-500"
      />
      <div className="flex flex-wrap gap-4">
        <Toggle label="Sensible à la casse" checked={ex.data.caseSensitive} onChange={(v) => onUpdate({ ...ex, data: { ...ex.data, caseSensitive: v } })} />
        <Toggle label="Sensible aux accents" checked={ex.data.accentSensitive} onChange={(v) => onUpdate({ ...ex, data: { ...ex.data, accentSensitive: v } })} />
      </div>
    </div>
  );
}

function TexteATrousConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "TEXTE_A_TROUS" }>>) {
  function onText(text: string) {
    const ids = [...text.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
    const unique = [...new Set(ids)];
    const blanks: Blank[] = unique.map((id) => ex.data.blanks.find((b) => b.id === id) ?? { id, type: "text" });
    const correctAnswer: Record<string, string[]> = {};
    for (const id of unique) correctAnswer[String(id)] = ex.correctAnswer[String(id)] ?? [];
    onUpdate({ ...ex, data: { ...ex.data, text, blanks }, correctAnswer });
  }
  const setBlank = (id: number, b: Partial<Blank>) =>
    onUpdate({ ...ex, data: { ...ex.data, blanks: ex.data.blanks.map((x) => (x.id === id ? { ...x, ...b } : x)) } });
  const setAccepted = (id: number, list: string[]) => onUpdate({ ...ex, correctAnswer: { ...ex.correctAnswer, [String(id)]: list } });

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-[var(--text-secondary)]">
        Texte — marquez les trous avec <code className="rounded bg-[var(--bg-secondary)] px-1">{"{{0}}"}</code>, <code className="rounded bg-[var(--bg-secondary)] px-1">{"{{1}}"}</code>…
      </label>
      <textarea
        value={ex.data.text}
        onChange={(e) => onText(e.target.value)}
        rows={3}
        placeholder="La photosynthèse transforme le {{0}} et l'eau en {{1}} grâce à la {{2}}."
        className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-orange-500"
      />
      {ex.data.blanks.map((b) => (
        <div key={b.id} className="rounded-xl border border-[var(--border-subtle)] p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-xs font-bold">{`{{${b.id}}}`}</span>
            <select value={b.type} onChange={(e) => setBlank(b.id, { type: e.target.value as "text" | "select" })} className={smallInput}>
              <option value="text">Saisie libre</option>
              <option value="select">Menu déroulant</option>
            </select>
          </div>
          {b.type === "select" && (
            <input
              value={(b.options ?? []).join(", ")}
              onChange={(e) => setBlank(b.id, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Options du menu, séparées par des virgules"
              className={cn(inputClass, "mt-2")}
            />
          )}
          <input
            value={(ex.correctAnswer[String(b.id)] ?? []).join(", ")}
            onChange={(e) => setAccepted(b.id, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            placeholder="Réponses acceptées (séparées par des virgules)"
            className={cn(inputClass, "mt-2")}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-4">
        <Toggle label="Sensible à la casse" checked={ex.data.caseSensitive} onChange={(v) => onUpdate({ ...ex, data: { ...ex.data, caseSensitive: v } })} />
        <Toggle label="Sensible aux accents" checked={ex.data.accentSensitive} onChange={(v) => onUpdate({ ...ex, data: { ...ex.data, accentSensitive: v } })} />
      </div>
    </div>
  );
}

function OrdonnancementConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "ORDONNANCEMENT" }>>) {
  // L'ordre de la liste = l'ordre correct. correctAnswer synchronisé.
  const sync = (items: typeof ex.data.items) => onUpdate({ ...ex, data: { ...ex.data, items }, correctAnswer: items.map((i) => i.id) });
  const setItem = (id: string, text: string) => sync(ex.data.items.map((i) => (i.id === id ? { ...i, text } : i)));
  const add = () => sync([...ex.data.items, { id: uid("i"), text: "" }]);
  const remove = (id: string) => sync(ex.data.items.filter((i) => i.id !== id));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= ex.data.items.length) return;
    const next = [...ex.data.items];
    [next[idx], next[j]] = [next[j], next[idx]];
    sync(next);
  };
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--text-secondary)]">Saisissez les éléments dans le bon ordre (ils seront mélangés pour l'apprenant) :</p>
      {ex.data.items.map((it, idx) => (
        <div key={it.id} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
          <span className="text-xs font-bold text-[var(--text-secondary)]">{idx + 1}</span>
          <input value={it.text} onChange={(e) => setItem(it.id, e.target.value)} placeholder="Élément" className={inputClass} />
          <IconBtn label="Monter" onClick={() => move(idx, -1)} disabled={idx === 0}>
            <ArrowUp className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Descendre" onClick={() => move(idx, 1)} disabled={idx === ex.data.items.length - 1}>
            <ArrowDown className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Supprimer" danger onClick={() => remove(it.id)}>
            <Trash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ))}
      <AddRow label="Ajouter un élément" onClick={add} />
    </div>
  );
}

function AppariementConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "APPARIEMENT" }>>) {
  const addLeft = () => onUpdate({ ...ex, data: { ...ex.data, leftItems: [...ex.data.leftItems, { id: uid("l"), text: "" }] } });
  const addRight = () => onUpdate({ ...ex, data: { ...ex.data, rightItems: [...ex.data.rightItems, { id: uid("r"), text: "" }] } });
  const setLeft = (id: string, text: string) => onUpdate({ ...ex, data: { ...ex.data, leftItems: ex.data.leftItems.map((l) => (l.id === id ? { ...l, text } : l)) } });
  const setRight = (id: string, text: string) => onUpdate({ ...ex, data: { ...ex.data, rightItems: ex.data.rightItems.map((r) => (r.id === id ? { ...r, text } : r)) } });
  const removeLeft = (id: string) => {
    const { [id]: _, ...rest } = ex.correctAnswer;
    onUpdate({ ...ex, data: { ...ex.data, leftItems: ex.data.leftItems.filter((l) => l.id !== id) }, correctAnswer: rest });
  };
  const removeRight = (id: string) => {
    const correctAnswer = Object.fromEntries(Object.entries(ex.correctAnswer).filter(([, r]) => r !== id));
    onUpdate({ ...ex, data: { ...ex.data, rightItems: ex.data.rightItems.filter((r) => r.id !== id) }, correctAnswer });
  };
  const setMatch = (leftId: string, rightId: string) => onUpdate({ ...ex, correctAnswer: { ...ex.correctAnswer, [leftId]: rightId } });

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[var(--text-secondary)]">Définissez les paires correctes :</p>
      {ex.data.leftItems.map((l) => (
        <div key={l.id} className="flex items-center gap-2">
          <input value={l.text} onChange={(e) => setLeft(l.id, e.target.value)} placeholder="Élément de gauche" className={inputClass} />
          <span className="text-[var(--text-secondary)]">→</span>
          <select value={ex.correctAnswer[l.id] ?? ""} onChange={(e) => setMatch(l.id, e.target.value)} className={inputClass}>
            <option value="">Associer à…</option>
            {ex.data.rightItems.map((r) => (
              <option key={r.id} value={r.id}>
                {r.text || "(vide)"}
              </option>
            ))}
          </select>
          <IconBtn label="Supprimer la paire" danger onClick={() => removeLeft(l.id)}>
            <Trash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ))}
      <AddRow label="Ajouter une paire" onClick={addLeft} />

      <div className="rounded-xl border border-[var(--border-subtle)] p-3">
        <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Éléments de droite (vous pouvez ajouter des distracteurs) :</p>
        <div className="space-y-2">
          {ex.data.rightItems.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <input value={r.text} onChange={(e) => setRight(r.id, e.target.value)} placeholder="Élément de droite" className={inputClass} />
              <IconBtn label="Supprimer" danger onClick={() => removeRight(r.id)}>
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            </div>
          ))}
        </div>
        <AddRow label="Ajouter un élément de droite" onClick={addRight} />
      </div>
    </div>
  );
}

function CalculConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "CALCUL" }>>) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Résultat attendu</label>
        <input type="number" value={ex.correctAnswer} onChange={(e) => onUpdate({ ...ex, correctAnswer: Number(e.target.value) || 0 })} className={cn(inputClass, "w-32")} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Tolérance ±</label>
        <input type="number" min={0} step="any" value={ex.data.tolerance} onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, tolerance: Math.max(0, Number(e.target.value) || 0) } })} className={cn(inputClass, "w-28")} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Unité (optionnel)</label>
        <input value={ex.data.unit ?? ""} onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, unit: e.target.value || null } })} placeholder="m, kg, °C…" className={cn(inputClass, "w-28")} />
      </div>
    </div>
  );
}

function ReponseLongueConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "REPONSE_LONGUE" }>>) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
        Correction manuelle : cette réponse sera envoyée au tuteur pour notation.
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Mots min. (0 = libre)</label>
          <input
            type="number"
            min={0}
            value={ex.data.minWords}
            onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, minWords: Math.max(0, Number(e.target.value) || 0) } })}
            className={cn(inputClass, "w-28")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Mots max. (0 = libre)</label>
          <input
            type="number"
            min={0}
            value={ex.data.maxWords}
            onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, maxWords: Math.max(0, Number(e.target.value) || 0) } })}
            className={cn(inputClass, "w-28")}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Grille de notation (visible par le tuteur)</label>
        <textarea
          value={ex.data.rubric}
          onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, rubric: e.target.value } })}
          rows={3}
          placeholder="Critères attendus : exactitude scientifique, clarté, exemples de classe…"
          className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
}

/* --------- petits composants --------- */
function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-dashed border-[var(--border-subtle)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--text-secondary)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded accent-orange-500" />
      {label}
    </label>
  );
}
