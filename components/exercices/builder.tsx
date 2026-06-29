"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Library, BookmarkPlus, Check } from "lucide-react";
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
  type Hotzone,
  type ImgTarget,
} from "@/lib/exercices/types";
import { Uploader } from "@/components/upload/uploader";
import { BankPicker } from "@/components/banque/bank-picker";
import { saveToBank } from "@/lib/banque/actions";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";
const smallInput =
  "h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500";

/** Builder d'un quiz : suite d'exercices auto-corrigés (concepteur). */
export function ExercicesBuilder({
  value,
  onChange,
  blobEnabled = false,
}: {
  value: QuizContent;
  onChange: (v: QuizContent) => void;
  blobEnabled?: boolean;
}) {
  const [newType, setNewType] = useState<ExerciceType>("QCU");
  const [picking, setPicking] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [, startSave] = useTransition();

  const patch = (p: Partial<QuizContent>) => onChange({ ...value, ...p });
  const saveExToBank = (ex: Exercice) =>
    startSave(async () => {
      const r = await saveToBank(ex);
      if (r.ok) {
        setSavedId(ex.id);
        setTimeout(() => setSavedId((cur) => (cur === ex.id ? null : cur)), 2000);
      }
    });
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

      {/* Mode et durée */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-[var(--border-subtle)] p-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Mode</label>
          <select
            value={value.mode ?? "practice"}
            onChange={(e) => patch({ mode: e.target.value as "practice" | "exam" })}
            className={cn(inputClass, "w-44")}
          >
            <option value="practice">Entraînement</option>
            <option value="exam">Examen</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Durée limite (min)</label>
          <input
            type="number"
            min={0}
            value={value.timeLimitMin ?? 0}
            onChange={(e) => patch({ timeLimitMin: Math.max(0, Number(e.target.value) || 0) })}
            className={cn(inputClass, "w-28")}
          />
        </div>
        {value.mode === "exam" && (
          <p className="min-w-0 flex-1 text-xs text-amber-700 dark:text-amber-300">
            Mode examen : tentative unique, sans retour en arrière ni correction détaillée, plein écran et détection de perte de focus.
          </p>
        )}
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
              <IconBtn
                label={savedId === ex.id ? "Enregistré dans la banque" : "Enregistrer dans la banque"}
                onClick={() => saveExToBank(ex)}
              >
                {savedId === ex.id ? <Check className="h-4 w-4 text-green-500" /> : <BookmarkPlus className="h-4 w-4" />}
              </IconBtn>
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
            <ExerciceConfig ex={ex} onUpdate={updateEx} blobEnabled={blobEnabled} />
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
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold transition-colors hover:border-orange-400 hover:text-orange-600"
        >
          <Library className="h-4 w-4" /> Banque
        </button>
      </div>

      <BankPicker
        open={picking}
        onClose={() => setPicking(false)}
        onImport={(exs) => patch({ exercices: [...value.exercices, ...exs] })}
      />
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
export function ExerciceConfig({ ex, onUpdate, blobEnabled }: { ex: Exercice; onUpdate: (e: Exercice) => void; blobEnabled: boolean }) {
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
    case "HOTSPOT":
      return <HotspotConfig ex={ex} onUpdate={onUpdate} blobEnabled={blobEnabled} />;
    case "GLISSER_DEPOSER_IMAGE":
      return <EtiquetageImageConfig ex={ex} onUpdate={onUpdate} blobEnabled={blobEnabled} />;
    case "REPONSE_LONGUE":
      return <ReponseLongueConfig ex={ex} onUpdate={onUpdate} />;
    case "DEPOT_FICHIER":
      return <DepotFichierConfig ex={ex} onUpdate={onUpdate} />;
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

function DepotFichierConfig({ ex, onUpdate }: Cfg<Extract<Exercice, { type: "DEPOT_FICHIER" }>>) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
        Correction manuelle : le fichier déposé sera envoyé au tuteur pour notation.
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Formats attendus</label>
          <input
            value={ex.data.acceptHint}
            onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, acceptHint: e.target.value } })}
            placeholder="PDF, image…"
            className={cn(inputClass, "w-44")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Taille max (Mo)</label>
          <input
            type="number"
            min={1}
            max={8}
            value={ex.data.maxMb}
            onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, maxMb: Math.min(8, Math.max(1, Number(e.target.value) || 1)) } })}
            className={cn(inputClass, "w-24")}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Grille de notation (visible par le tuteur)</label>
        <textarea
          value={ex.data.rubric}
          onChange={(e) => onUpdate({ ...ex, data: { ...ex.data, rubric: e.target.value } })}
          rows={2}
          placeholder="Critères de correction du devoir…"
          className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
}

/* --------- configurateurs image (hotspot / étiquetage) --------- */
const clampPos = (v: number, size = 0) => Math.max(0, Math.min(100 - size, Math.round(v)));

function ImageField({
  imageUrl,
  blobEnabled,
  onUrl,
}: {
  imageUrl: string;
  blobEnabled: boolean;
  onUrl: (url: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Uploader
        blobEnabled={blobEnabled}
        prefix="exercices"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        maxMb={5}
        compact
        hint="Image de l'exercice — 5 Mo max."
        onUploaded={async (r) => onUrl(r.url)}
      />
      <input
        value={imageUrl}
        onChange={(e) => onUrl(e.target.value)}
        placeholder="…ou collez l'URL d'une image"
        className={cn(smallInput, "w-full")}
      />
    </div>
  );
}

function NumPct({ label, value, max = 100, onChange }: { label: string; value: number; max?: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
        className={cn(smallInput, "w-14")}
      />
    </label>
  );
}

function HotspotConfig({ ex, onUpdate, blobEnabled }: { ex: Extract<Exercice, { type: "HOTSPOT" }>; onUpdate: (e: Exercice) => void; blobEnabled: boolean }) {
  const right = new Set(ex.correctAnswer);
  const setData = (zones: Hotzone[], correctAnswer = ex.correctAnswer) => onUpdate({ ...ex, data: { ...ex.data, zones }, correctAnswer });
  const updateZone = (id: string, patch: Partial<Hotzone>) => setData(ex.data.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  const removeZone = (id: string) => setData(ex.data.zones.filter((z) => z.id !== id), ex.correctAnswer.filter((c) => c !== id));
  const addZoneAt = (x: number, y: number) => {
    const w = 16, h = 12;
    setData([...ex.data.zones, { id: uid("z"), label: "", x: clampPos(x - w / 2, w), y: clampPos(y - h / 2, h), w, h }]);
  };
  const toggleCorrect = (id: string) => {
    if (ex.data.multiple) {
      const n = new Set(right);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      onUpdate({ ...ex, correctAnswer: [...n] });
    } else {
      onUpdate({ ...ex, correctAnswer: [id] });
    }
  };
  const setMultiple = (multiple: boolean) =>
    onUpdate({ ...ex, data: { ...ex.data, multiple }, correctAnswer: multiple ? ex.correctAnswer : ex.correctAnswer.slice(0, 1) });

  return (
    <div className="space-y-3">
      <ImageField imageUrl={ex.data.imageUrl} blobEnabled={blobEnabled} onUrl={(url) => onUpdate({ ...ex, data: { ...ex.data, imageUrl: url } })} />
      <Toggle label="Plusieurs zones correctes" checked={ex.data.multiple} onChange={setMultiple} />
      {ex.data.imageUrl && (
        <div
          className="relative cursor-crosshair overflow-hidden rounded-lg border border-[var(--border-subtle)]"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            addZoneAt(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ex.data.imageUrl} alt="" className="block w-full select-none" />
          {ex.data.zones.map((z, i) => (
            <div
              key={z.id}
              style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` }}
              className={cn(
                "pointer-events-none absolute flex items-center justify-center rounded-md border-2 text-[10px] font-bold",
                right.has(z.id) ? "border-green-500 bg-green-500/25 text-green-700" : "border-orange-500 bg-orange-500/20 text-orange-700"
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-[var(--text-secondary)]">Cliquez sur l'image pour ajouter une zone, puis ajustez ses dimensions (%).</p>
      <div className="space-y-2">
        {ex.data.zones.map((z, i) => (
          <div key={z.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-subtle)] p-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--bg-secondary)] text-xs font-bold">{i + 1}</span>
            <input value={z.label} onChange={(e) => updateZone(z.id, { label: e.target.value })} placeholder="Libellé (ex. noyau)" className={cn(smallInput, "min-w-32 flex-1")} />
            <NumPct label="x" value={z.x} onChange={(v) => updateZone(z.id, { x: v })} />
            <NumPct label="y" value={z.y} onChange={(v) => updateZone(z.id, { y: v })} />
            <NumPct label="l" value={z.w} onChange={(v) => updateZone(z.id, { w: v })} />
            <NumPct label="h" value={z.h} onChange={(v) => updateZone(z.id, { h: v })} />
            <label className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300">
              <input type={ex.data.multiple ? "checkbox" : "radio"} name={`hs-${ex.id}`} checked={right.has(z.id)} onChange={() => toggleCorrect(z.id)} className="h-4 w-4 accent-green-500" />
              correcte
            </label>
            <IconBtn label="Supprimer la zone" danger onClick={() => removeZone(z.id)}>
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        ))}
        {ex.data.zones.length === 0 && <p className="text-xs text-[var(--text-secondary)]">Aucune zone définie.</p>}
      </div>
    </div>
  );
}

function EtiquetageImageConfig({ ex, onUpdate, blobEnabled }: { ex: Extract<Exercice, { type: "GLISSER_DEPOSER_IMAGE" }>; onUpdate: (e: Exercice) => void; blobEnabled: boolean }) {
  const setTargets = (targets: ImgTarget[]) => onUpdate({ ...ex, data: { ...ex.data, targets } });
  const updateTarget = (id: string, patch: Partial<ImgTarget>) => setTargets(ex.data.targets.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTarget = (id: string) => setTargets(ex.data.targets.filter((t) => t.id !== id));
  const addTargetAt = (x: number, y: number) => setTargets([...ex.data.targets, { id: uid("t"), label: "", x: clampPos(x), y: clampPos(y) }]);

  return (
    <div className="space-y-3">
      <ImageField imageUrl={ex.data.imageUrl} blobEnabled={blobEnabled} onUrl={(url) => onUpdate({ ...ex, data: { ...ex.data, imageUrl: url } })} />
      {ex.data.imageUrl && (
        <div
          className="relative cursor-crosshair overflow-hidden rounded-lg border border-[var(--border-subtle)]"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            addTargetAt(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ex.data.imageUrl} alt="" className="block w-full select-none" />
          {ex.data.targets.map((t, i) => (
            <div
              key={t.id}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-orange-500 bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white"
            >
              {t.label || i + 1}
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-[var(--text-secondary)]">Cliquez sur l'image pour placer une cible, puis saisissez son étiquette (la bonne réponse).</p>
      <div className="space-y-2">
        {ex.data.targets.map((t, i) => (
          <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-subtle)] p-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--bg-secondary)] text-xs font-bold">{i + 1}</span>
            <input value={t.label} onChange={(e) => updateTarget(t.id, { label: e.target.value })} placeholder="Étiquette correcte" className={cn(smallInput, "min-w-32 flex-1")} />
            <NumPct label="x" value={t.x} onChange={(v) => updateTarget(t.id, { x: v })} />
            <NumPct label="y" value={t.y} onChange={(v) => updateTarget(t.id, { y: v })} />
            <IconBtn label="Supprimer la cible" danger onClick={() => removeTarget(t.id)}>
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        ))}
        {ex.data.targets.length === 0 && <p className="text-xs text-[var(--text-secondary)]">Aucune cible définie.</p>}
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
