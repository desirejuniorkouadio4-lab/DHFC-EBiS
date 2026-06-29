"use client";

import { CheckCircle2, XCircle, ArrowUp, ArrowDown, Clock, Award, Paperclip, Download } from "lucide-react";
import type { Exercice } from "@/lib/exercices/types";
import type { GradeResult } from "@/lib/exercices/grade";
import { submitAssignmentUrl } from "@/lib/lms/actions";
import { Uploader } from "@/components/upload/uploader";
import { cn } from "@/lib/utils";

export type SubmissionView = {
  answer: string;
  status: "PENDING" | "GRADED";
  score: number | null;
  maxScore: number;
  feedback: string | null;
};

type PlayerProps<T extends Exercice = Exercice> = {
  exercice: T;
  answer: unknown;
  onChange: (a: unknown) => void;
  submitted: boolean;
  result?: GradeResult;
  submission?: SubmissionView;
  slug?: string;
  lessonId?: string;
  blobEnabled?: boolean;
};

/** Player d'exercice (apprenant) — dispatcher par type, feedback instantané. */
export function ExercicePlayer(props: PlayerProps) {
  const { exercice } = props;
  switch (exercice.type) {
    case "QCU":
      return <QCUPlayer {...props} exercice={exercice} />;
    case "QCM":
      return <QCMPlayer {...props} exercice={exercice} />;
    case "VRAI_FAUX":
      return <VraiFauxPlayer {...props} exercice={exercice} />;
    case "REPONSE_COURTE":
      return <ReponseCourtePlayer {...props} exercice={exercice} />;
    case "TEXTE_A_TROUS":
      return <TexteATrousPlayer {...props} exercice={exercice} />;
    case "ORDONNANCEMENT":
      return <OrdonnancementPlayer {...props} exercice={exercice} />;
    case "APPARIEMENT":
      return <AppariementPlayer {...props} exercice={exercice} />;
    case "CALCUL":
      return <CalculPlayer {...props} exercice={exercice} />;
    case "REPONSE_LONGUE":
      return <ReponseLonguePlayer {...props} exercice={exercice} />;
    case "DEPOT_FICHIER":
      return <DepotFichierPlayer {...props} exercice={exercice} />;
  }
}

function fileLabel(url: string): string {
  const last = url.split("/").pop() ?? "fichier";
  return last.replace(/^[a-z0-9]+-[a-z0-9]+-/, "");
}

function DepotFichierPlayer({ exercice, submission, slug, lessonId, blobEnabled }: PlayerProps<Extract<Exercice, { type: "DEPOT_FICHIER" }>>) {
  // Déjà corrigé.
  if (submission?.status === "GRADED") {
    return (
      <div className="space-y-3">
        <FileLink url={submission.answer} />
        <div className="rounded-xl border border-green-400 bg-green-50 p-4 dark:bg-green-500/10">
          <p className="flex items-center gap-2 font-bold text-green-700 dark:text-green-300">
            <Award className="h-4 w-4" /> Corrigé : {submission.score}/{submission.maxScore}
          </p>
          {submission.feedback && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{submission.feedback}</p>
          )}
        </div>
      </div>
    );
  }

  // Déposé, en attente de correction.
  if (submission?.status === "PENDING") {
    return (
      <div className="space-y-2">
        <FileLink url={submission.answer} />
        <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Clock className="h-3.5 w-3.5" /> Déposé — en attente de correction
        </p>
      </div>
    );
  }

  // Dépôt.
  if (!slug || !lessonId) return null;
  return (
    <Uploader
      blobEnabled={blobEnabled ?? false}
      prefix="devoirs"
      accept="application/pdf,image/png,image/jpeg,image/webp"
      maxMb={exercice.data.maxMb || 8}
      hint={`${exercice.data.acceptHint} · ${exercice.data.maxMb} Mo max`}
      compact
      onUploaded={submitAssignmentUrl.bind(null, slug, lessonId, exercice.id, exercice.prompt)}
    />
  );
}

function FileLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 text-sm font-medium transition-colors hover:border-orange-400"
    >
      <Paperclip className="h-4 w-4 text-orange-500" />
      <span className="truncate">{fileLabel(url)}</span>
      <Download className="ml-auto h-4 w-4 text-[var(--text-secondary)]" />
    </a>
  );
}

/* --------- options (QCU/QCM) --------- */
function optionClass(state: "idle" | "selected" | "right" | "wrong") {
  return cn(
    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
    state === "idle" && "border-[var(--border-subtle)] hover:border-orange-300",
    state === "selected" && "border-orange-400 bg-orange-50 dark:bg-orange-500/10",
    state === "right" && "border-green-400 bg-green-50 dark:bg-green-500/10",
    state === "wrong" && "border-red-400 bg-red-50 dark:bg-red-500/10"
  );
}

function QCUPlayer({ exercice, answer, onChange, submitted }: PlayerProps<Extract<Exercice, { type: "QCU" }>>) {
  const sel = typeof answer === "string" ? answer : "";
  return (
    <div className="space-y-2">
      {exercice.data.options.map((o) => {
        const selected = sel === o.id;
        const isRight = o.id === exercice.correctAnswer;
        const state = submitted ? (isRight ? "right" : selected ? "wrong" : "idle") : selected ? "selected" : "idle";
        return (
          <label key={o.id} className={optionClass(state)}>
            <input type="radio" name={exercice.id} checked={selected} disabled={submitted} onChange={() => onChange(o.id)} className="h-4 w-4 accent-orange-500" />
            <span className="flex-1">{o.text}</span>
            {submitted && isRight && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {submitted && selected && !isRight && <XCircle className="h-4 w-4 text-red-500" />}
          </label>
        );
      })}
    </div>
  );
}

function QCMPlayer({ exercice, answer, onChange, submitted }: PlayerProps<Extract<Exercice, { type: "QCM" }>>) {
  const sel = new Set(Array.isArray(answer) ? (answer as string[]) : []);
  function toggle(id: string) {
    const n = new Set(sel);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    onChange([...n]);
  }
  const right = new Set(exercice.correctAnswer);
  return (
    <div className="space-y-2">
      {exercice.data.options.map((o) => {
        const selected = sel.has(o.id);
        const isRight = right.has(o.id);
        const state = submitted
          ? isRight
            ? "right"
            : selected
              ? "wrong"
              : "idle"
          : selected
            ? "selected"
            : "idle";
        return (
          <label key={o.id} className={optionClass(state)}>
            <input type="checkbox" checked={selected} disabled={submitted} onChange={() => toggle(o.id)} className="h-4 w-4 rounded accent-orange-500" />
            <span className="flex-1">{o.text}</span>
            {submitted && isRight && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            {submitted && selected && !isRight && <XCircle className="h-4 w-4 text-red-500" />}
          </label>
        );
      })}
    </div>
  );
}

function VraiFauxPlayer({ exercice, answer, onChange, submitted }: PlayerProps<Extract<Exercice, { type: "VRAI_FAUX" }>>) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[true, false].map((val) => {
        const selected = answer === val;
        const isRight = exercice.correctAnswer === val;
        const state = submitted ? (isRight ? "right" : selected ? "wrong" : "idle") : selected ? "selected" : "idle";
        return (
          <button
            key={String(val)}
            type="button"
            disabled={submitted}
            onClick={() => onChange(val)}
            className={cn(optionClass(state), "justify-center font-semibold")}
          >
            {val ? "Vrai" : "Faux"}
            {submitted && isRight && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </button>
        );
      })}
    </div>
  );
}

function ReponseCourtePlayer({ exercice, answer, onChange, submitted, result }: PlayerProps<Extract<Exercice, { type: "REPONSE_COURTE" }>>) {
  return (
    <div>
      <input
        value={typeof answer === "string" ? answer : ""}
        disabled={submitted}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Votre réponse…"
        className={cn(
          "h-11 w-full rounded-xl border bg-[var(--bg-primary)] px-4 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
          submitted ? (result?.correct ? "border-green-400" : "border-red-400") : "border-[var(--border-subtle)]"
        )}
      />
      {submitted && !result?.correct && (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Réponse attendue : <strong>{exercice.correctAnswer[0]}</strong>
        </p>
      )}
    </div>
  );
}

function TexteATrousPlayer({ exercice, answer, onChange, submitted }: PlayerProps<Extract<Exercice, { type: "TEXTE_A_TROUS" }>>) {
  const ans = (answer ?? {}) as Record<string, string>;
  const set = (id: number, v: string) => onChange({ ...ans, [id]: v });
  const parts = exercice.data.text.split(/(\{\{\d+\}\})/g);
  return (
    <p className="leading-loose">
      {parts.map((part, i) => {
        const m = part.match(/^\{\{(\d+)\}\}$/);
        if (!m) return <span key={i}>{part}</span>;
        const id = Number(m[1]);
        const blank = exercice.data.blanks.find((b) => b.id === id);
        if (!blank) return <span key={i}>{part}</span>;
        const val = ans[String(id)] ?? "";
        const accepted = exercice.correctAnswer[String(id)] ?? [];
        const ok = submitted && accepted.some((a) => a.trim().toLowerCase() === val.trim().toLowerCase());
        const border = submitted ? (ok ? "border-green-400" : "border-red-400") : "border-orange-300 focus:border-orange-500";
        if (blank.type === "select") {
          return (
            <select
              key={i}
              value={val}
              disabled={submitted}
              onChange={(e) => set(id, e.target.value)}
              className={cn("mx-1 h-8 rounded-lg border bg-[var(--bg-primary)] px-2 text-sm outline-none", border)}
            >
              <option value="">—</option>
              {(blank.options ?? []).map((opt, oi) => (
                <option key={oi} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            key={i}
            value={val}
            disabled={submitted}
            onChange={(e) => set(id, e.target.value)}
            size={Math.max(6, (accepted[0]?.length ?? 8))}
            className={cn("mx-1 inline-block h-8 rounded-lg border bg-[var(--bg-primary)] px-2 text-sm outline-none", border)}
          />
        );
      })}
    </p>
  );
}

function OrdonnancementPlayer({ exercice, answer, onChange, submitted }: PlayerProps<Extract<Exercice, { type: "ORDONNANCEMENT" }>>) {
  const order = Array.isArray(answer) && answer.length ? (answer as string[]) : exercice.data.items.map((i) => i.id);
  const byId = new Map(exercice.data.items.map((i) => [i.id, i.text]));
  function move(idx: number, dir: -1 | 1) {
    const next = [...order];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }
  return (
    <ul className="space-y-2">
      {order.map((id, idx) => {
        const rightPos = exercice.correctAnswer[idx] === id;
        return (
          <li
            key={id}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-[var(--bg-primary)] px-3 py-2.5 text-sm",
              submitted ? (rightPos ? "border-green-400" : "border-red-400") : "border-[var(--border-subtle)]"
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--bg-secondary)] text-xs font-bold">{idx + 1}</span>
            <span className="flex-1">{byId.get(id)}</span>
            {!submitted && (
              <span className="flex gap-1">
                <button type="button" aria-label="Monter" onClick={() => move(idx, -1)} disabled={idx === 0} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] disabled:opacity-30 hover:border-orange-400">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Descendre" onClick={() => move(idx, 1)} disabled={idx === order.length - 1} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] disabled:opacity-30 hover:border-orange-400">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AppariementPlayer({ exercice, answer, onChange, submitted }: PlayerProps<Extract<Exercice, { type: "APPARIEMENT" }>>) {
  const ans = (answer ?? {}) as Record<string, string>;
  const rightById = new Map(exercice.data.rightItems.map((r) => [r.id, r.text]));
  return (
    <div className="space-y-2">
      {exercice.data.leftItems.map((l) => {
        const val = ans[l.id] ?? "";
        const ok = submitted && exercice.correctAnswer[l.id] === val && val !== "";
        return (
          <div key={l.id} className="flex items-center gap-3">
            <span className="min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm">{l.text}</span>
            <span className="text-[var(--text-secondary)]">→</span>
            <select
              value={val}
              disabled={submitted}
              onChange={(e) => onChange({ ...ans, [l.id]: e.target.value })}
              className={cn(
                "h-11 min-w-0 flex-1 rounded-xl border bg-[var(--bg-primary)] px-3 text-sm outline-none",
                submitted ? (ok ? "border-green-400" : "border-red-400") : "border-[var(--border-subtle)] focus:border-orange-500"
              )}
            >
              <option value="">Choisir…</option>
              {exercice.data.rightItems.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.text}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      {submitted && (
        <p className="text-xs text-[var(--text-secondary)]">
          Réponses attendues :{" "}
          {Object.entries(exercice.correctAnswer)
            .map(([l, r]) => `${exercice.data.leftItems.find((x) => x.id === l)?.text} → ${rightById.get(r)}`)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}

function ReponseLonguePlayer({ exercice, answer, onChange, submitted, submission }: PlayerProps<Extract<Exercice, { type: "REPONSE_LONGUE" }>>) {
  const text = typeof answer === "string" ? answer : "";
  const displayedAnswer = submission?.answer ?? text;
  const words = displayedAnswer.trim() ? displayedAnswer.trim().split(/\s+/).length : 0;

  // Déjà corrigée par le tuteur.
  if (submission?.status === "GRADED") {
    return (
      <div className="space-y-3">
        <div className="whitespace-pre-wrap rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 text-sm">
          {submission.answer}
        </div>
        <div className="rounded-xl border border-green-400 bg-green-50 p-4 dark:bg-green-500/10">
          <p className="flex items-center gap-2 font-bold text-green-700 dark:text-green-300">
            <Award className="h-4 w-4" /> Corrigé : {submission.score}/{submission.maxScore}
          </p>
          {submission.feedback && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{submission.feedback}</p>
          )}
        </div>
      </div>
    );
  }

  // Soumise et en attente de correction (depuis la base, ou à l'instant).
  if (submission?.status === "PENDING" || (submitted && text.trim())) {
    return (
      <div className="space-y-2">
        <div className="whitespace-pre-wrap rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 text-sm">
          {displayedAnswer}
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Clock className="h-3.5 w-3.5" /> Envoyée au tuteur — en attente de correction
        </p>
      </div>
    );
  }

  // Saisie.
  const min = exercice.data.minWords;
  const max = exercice.data.maxWords;
  return (
    <div>
      <textarea
        value={text}
        disabled={submitted}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Rédigez votre réponse…"
        className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
      />
      <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
        {words} mot{words > 1 ? "s" : ""}
        {min > 0 && ` · minimum ${min}`}
        {max > 0 && ` · maximum ${max}`}
        {" · corrigé par le tuteur"}
      </p>
    </div>
  );
}

function CalculPlayer({ exercice, answer, onChange, submitted, result }: PlayerProps<Extract<Exercice, { type: "CALCUL" }>>) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          inputMode="decimal"
          value={typeof answer === "string" ? answer : ""}
          disabled={submitted}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Résultat…"
          className={cn(
            "h-11 w-40 rounded-xl border bg-[var(--bg-primary)] px-4 text-sm outline-none transition-colors focus:border-orange-500",
            submitted ? (result?.correct ? "border-green-400" : "border-red-400") : "border-[var(--border-subtle)]"
          )}
        />
        {exercice.data.unit && <span className="text-sm text-[var(--text-secondary)]">{exercice.data.unit}</span>}
      </div>
      {submitted && !result?.correct && (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Réponse attendue : <strong>{exercice.correctAnswer}</strong>
          {exercice.data.unit ? ` ${exercice.data.unit}` : ""}
          {exercice.data.tolerance ? ` (± ${exercice.data.tolerance})` : ""}
        </p>
      )}
    </div>
  );
}
