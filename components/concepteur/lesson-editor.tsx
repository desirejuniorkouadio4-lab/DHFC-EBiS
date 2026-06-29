"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, Loader2, PlayCircle, FileText, Target } from "lucide-react";
import type { LessonType } from "@prisma/client";
import { updateLesson, type LessonContentInput } from "@/lib/concepteur/actions";
import { ExercicesBuilder } from "@/components/exercices/builder";
import { normalizeQuizContent } from "@/lib/exercices/legacy";
import type { QuizContent } from "@/lib/exercices/types";
import { BlockEditor } from "@/components/concepteur/block-editor";
import { normalizeBlocks, type Block } from "@/lib/blocks/types";
import { CompletionAccessEditor } from "@/components/concepteur/completion-editor";
import { normalizeCompletion, normalizeAccess, type CompletionRule, type AccessRule } from "@/lib/completion/types";
import type { LessonSibling } from "@/lib/concepteur/db";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";
const textareaClass =
  "w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";
const labelClass = "text-sm font-medium";

type Chapter = { time: string; label: string };

type Content = Record<string, unknown>;

function asContent(value: unknown): Content {
  return value && typeof value === "object" ? (value as Content) : {};
}

/** Éditeur de leçon : métadonnées + contenu selon le type. */
export function LessonEditor({
  lessonId,
  initialTitle,
  initialType,
  initialDuration,
  initialContent,
  initialCompletion,
  initialAccess,
  siblings,
  backHref,
  blobEnabled,
}: {
  lessonId: string;
  initialTitle: string;
  initialType: LessonType;
  initialDuration: number;
  initialContent: unknown;
  initialCompletion: unknown;
  initialAccess: unknown;
  siblings: LessonSibling[];
  backHref: string;
  blobEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const c = asContent(initialContent);

  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<LessonType>(initialType);
  const [duration, setDuration] = useState(initialDuration);
  const [completion, setCompletion] = useState<CompletionRule>(() => normalizeCompletion(initialCompletion));
  const [access, setAccess] = useState<AccessRule>(() => normalizeAccess(initialAccess));

  // Lecture (blocs de contenu) — normalise l'ancien format au chargement.
  const [blocks, setBlocks] = useState<Block[]>(() => normalizeBlocks(initialContent).blocks);

  // Vidéo
  const [videoIntro, setVideoIntro] = useState(typeof c.intro === "string" && c.kind === "video" ? c.intro : "");
  const [transcript, setTranscript] = useState(typeof c.transcript === "string" ? c.transcript : "");
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const arr = Array.isArray(c.chapters) ? (c.chapters as { time?: string; label?: string }[]) : [];
    return arr.map((ch) => ({ time: ch.time ?? "", label: ch.label ?? "" }));
  });

  // Quiz (moteur d'exercices) — normalise l'ancien format au chargement.
  const [quiz, setQuiz] = useState<QuizContent>(() => normalizeQuizContent(initialContent));

  function buildContent(): LessonContentInput {
    if (type === "VIDEO") {
      return {
        kind: "video",
        intro: videoIntro.trim(),
        chapters: chapters.filter((ch) => ch.time.trim() || ch.label.trim()),
        transcript: transcript.trim(),
      };
    }
    if (type === "QUIZ") {
      return { ...quiz, intro: quiz.intro.trim() };
    }
    return { kind: "blocks", blocks };
  }

  function save() {
    if (!title.trim()) return;
    const content = buildContent();
    startTransition(async () => {
      await updateLesson(lessonId, { title: title.trim(), type, durationMin: duration, content, completion, access });
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Métadonnées de la leçon */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <div className="space-y-1.5">
          <label htmlFor="lesson-title" className={labelClass}>
            Titre de la leçon <span className="text-orange-600">*</span>
          </label>
          <input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mt-5 space-y-2">
          <span className={labelClass}>Type de contenu</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "TEXTE", label: "Lecture", icon: FileText },
                { value: "VIDEO", label: "Vidéo", icon: PlayCircle },
                { value: "QUIZ", label: "Quiz", icon: Target },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                  type === opt.value
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-orange-300"
                )}
              >
                <opt.icon className="h-4 w-4" /> {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 max-w-[12rem] space-y-1.5">
          <label htmlFor="lesson-duration" className={labelClass}>
            Durée (minutes)
          </label>
          <input
            id="lesson-duration"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 1)}
            className={inputClass}
          />
        </div>
      </section>

      {/* Contenu selon le type */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="mb-4 font-bold">Contenu</h2>

        {type === "TEXTE" && <BlockEditor value={blocks} onChange={setBlocks} blobEnabled={blobEnabled} />}
        {type === "VIDEO" && (
          <VideoEditor
            intro={videoIntro}
            setIntro={setVideoIntro}
            transcript={transcript}
            setTranscript={setTranscript}
            chapters={chapters}
            setChapters={setChapters}
          />
        )}
        {type === "QUIZ" && <ExercicesBuilder value={quiz} onChange={setQuiz} blobEnabled={blobEnabled} />}
      </section>

      {/* Achèvement & restrictions d'accès (Moodle-like) */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="mb-4 font-bold">Achèvement &amp; disponibilité</h2>
        <CompletionAccessEditor
          completion={completion}
          setCompletion={setCompletion}
          access={access}
          setAccess={setAccess}
          siblings={siblings}
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending || !title.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Enregistrer la leçon
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Vidéo ---------------- */
function VideoEditor({
  intro,
  setIntro,
  transcript,
  setTranscript,
  chapters,
  setChapters,
}: {
  intro: string;
  setIntro: (v: string) => void;
  transcript: string;
  setTranscript: (v: string) => void;
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className={labelClass}>Introduction</label>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          placeholder="Présentation de la séquence vidéo."
          className={textareaClass}
        />
      </div>

      <div className="space-y-2">
        <span className={labelClass}>Chapitres</span>
        {chapters.map((ch, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={ch.time}
              onChange={(e) => setChapters((arr) => arr.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))}
              placeholder="00:00"
              className="h-10 w-24 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-orange-500"
            />
            <input
              value={ch.label}
              onChange={(e) => setChapters((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              placeholder="Intitulé du chapitre"
              className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => setChapters((arr) => arr.filter((_, j) => j !== i))}
              aria-label="Supprimer le chapitre"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setChapters((arr) => [...arr, { time: "", label: "" }])}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-dashed border-[var(--border-subtle)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
        >
          <Plus className="h-4 w-4" /> Ajouter un chapitre
        </button>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Transcription</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={3}
          placeholder="Transcription textuelle de la vidéo (accessibilité)."
          className={textareaClass}
        />
      </div>
    </div>
  );
}

