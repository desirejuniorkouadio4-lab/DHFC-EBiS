"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ListTree,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  CircleDot,
  PlayCircle,
  FileText,
  Target,
  Play,
  Settings,
  Maximize,
  Download,
  Check,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ProgressBar } from "@/components/lms/progress-bar";
import { toggleLessonComplete, markLessonComplete, submitEssays } from "@/lib/lms/actions";
import type { Curriculum, Lesson, LessonType } from "@/lib/lms/curriculum";
import { ExercicePlayer, type SubmissionView } from "@/components/exercices/player";
import { normalizeQuizContent } from "@/lib/exercices/legacy";
import { emptyAnswer, isManualType, type Exercice } from "@/lib/exercices/types";
import { gradeQuiz } from "@/lib/exercices/grade";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  video: PlayCircle,
  texte: FileText,
  quiz: Target,
};

const TABS = ["Aperçu", "Mes notes", "Discussion", "Ressources", "Transcript"] as const;
type Tab = (typeof TABS)[number];

export function CoursePlayer({
  slug,
  lessonId,
  curriculum,
  initialCompleted,
  submissions = {},
}: {
  slug: string;
  lessonId: string;
  curriculum: Curriculum;
  initialCompleted: string[];
  submissions?: Record<string, SubmissionView>;
}) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set(initialCompleted));
  const [, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("Aperçu");

  useEffect(() => {
    setCompleted(new Set(initialCompleted));
  }, [initialCompleted]);

  useEffect(() => {
    setTab("Aperçu");
  }, [lessonId]);

  const flat = curriculum.flat;
  const index = flat.findIndex((l) => l.id === lessonId);
  const lesson = index >= 0 ? flat[index] : null;
  const prev = index > 0 ? flat[index - 1] : null;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;

  const isCompleted = (id: string) => completed.has(id);

  function toggle(id: string) {
    setCompleted((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    startTransition(() => {
      void toggleLessonComplete(slug, id);
    });
  }

  function markDone(id: string) {
    setCompleted((prev) => new Set(prev).add(id));
    startTransition(() => {
      void markLessonComplete(slug, id);
    });
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="text-lg font-semibold">Leçon introuvable</p>
          <Link href="/mes-parcours" className="mt-3 inline-block text-sm font-semibold text-orange-600">
            Retour à mes parcours
          </Link>
        </div>
      </div>
    );
  }

  const total = curriculum.totalLessons;
  const completedCount = flat.filter((l) => completed.has(l.id)).length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  const done = isCompleted(lesson.id);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/mes-parcours" aria-label="Quitter le cours" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] hover:border-orange-400">
            <X className="h-4 w-4" />
          </Link>
          <LogoMark className="hidden h-8 w-auto sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{curriculum.title}</p>
            <p className="truncate text-xs text-[var(--text-secondary)]">{lesson.moduleTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden w-40 items-center gap-2 md:flex">
            <ProgressBar value={percent} className="flex-1" />
            <span className="text-xs font-semibold text-orange-600">{percent}%</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3 text-sm font-medium lg:hidden"
          >
            <ListTree className="h-4 w-4" /> Sommaire
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] lg:block">
          <CourseSidebar slug={slug} curriculum={curriculum} currentId={lesson.id} isCompleted={isCompleted} />
        </aside>

        {/* Sommaire mobile (bottom sheet) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <button aria-label="Fermer" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <motion.aside
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col rounded-t-3xl bg-[var(--bg-primary)] pb-safe shadow-2xl"
              >
                <div className="flex flex-col items-center pt-3">
                  <span className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="font-semibold">Sommaire du cours</span>
                  <button onClick={() => setSidebarOpen(false)} aria-label="Fermer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <CourseSidebar slug={slug} curriculum={curriculum} currentId={lesson.id} isCompleted={isCompleted} />
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu */}
        <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-8 sm:py-8 lg:pb-8">
          <div className="mx-auto max-w-3xl">
            <LessonContent lesson={lesson} onPassQuiz={() => markDone(lesson.id)} slug={slug} submissions={submissions} />

            {/* Onglets */}
            <div className="mt-8">
              <div className="flex gap-1 overflow-x-auto border-b border-[var(--border-subtle)]">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                      tab === t
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="py-6">
                <LessonTab tab={tab} lesson={lesson} />
              </div>
            </div>

            {/* Navigation bas (desktop) */}
            <div className="mt-6 hidden flex-col items-stretch gap-3 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between lg:flex">
              {prev ? (
                <Link
                  href={`/apprendre/${slug}/${prev.id}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] px-5 text-sm font-semibold transition-colors hover:border-orange-400"
                >
                  <ChevronLeft className="h-4 w-4" /> Précédent
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}

              <button
                type="button"
                onClick={() => toggle(lesson.id)}
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors",
                  done
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "border border-[var(--border-subtle)] hover:border-green-400 hover:text-green-600"
                )}
              >
                <Check className="h-4 w-4" />
                {done ? "Leçon terminée" : "Marquer comme terminé"}
              </button>

              {next ? (
                <Link
                  href={`/apprendre/${slug}/${next.id}`}
                  onClick={() => markDone(lesson.id)}
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Suivant <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <Link
                  href="/mes-parcours"
                  onClick={() => markDone(lesson.id)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-green-500 px-5 text-sm font-semibold text-white hover:bg-green-600"
                >
                  Terminer le parcours <CheckCircle2 className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Barre d'action fixe (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 px-4 py-3 pb-safe backdrop-blur lg:hidden">
        {prev ? (
          <Link
            href={`/apprendre/${slug}/${prev.id}`}
            aria-label="Leçon précédente"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-11 w-11 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => toggle(lesson.id)}
          className={cn(
            "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
            done ? "bg-green-500 text-white" : "border border-[var(--border-subtle)] text-[var(--text-primary)]"
          )}
        >
          <Check className="h-4 w-4" />
          {done ? "Terminée" : "Marquer terminé"}
        </button>

        {next ? (
          <Link
            href={`/apprendre/${slug}/${next.id}`}
            onClick={() => markDone(lesson.id)}
            aria-label="Leçon suivante"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <Link
            href="/mes-parcours"
            onClick={() => markDone(lesson.id)}
            aria-label="Terminer le parcours"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500 text-white"
          >
            <CheckCircle2 className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ===========================================================
 *  Sidebar du cours
 * =========================================================== */
function CourseSidebar({
  slug,
  curriculum,
  currentId,
  isCompleted,
}: {
  slug: string;
  curriculum: Curriculum;
  currentId: string;
  isCompleted: (id: string) => boolean;
}) {
  return (
    <div className="p-3">
      {curriculum.modules.map((mod) => (
        <div key={mod.index} className="mb-2">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {mod.title}
          </p>
          <ul className="space-y-0.5">
            {mod.lessons.map((l) => {
              const Icon = TYPE_ICON[l.type];
              const current = l.id === currentId;
              const completed = isCompleted(l.id);
              return (
                <li key={l.id}>
                  <Link
                    href={`/apprendre/${slug}/${l.id}`}
                    className={cn(
                      "flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      current
                        ? "bg-orange-50 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                        : "hover:bg-[var(--bg-secondary)]"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    ) : current ? (
                      <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300 dark:text-neutral-600" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block leading-snug">{l.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-[var(--text-secondary)]">
                        <Icon className="h-3 w-3" />
                        {l.durationMin} min
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ===========================================================
 *  Contenu de la leçon (selon le type)
 * =========================================================== */
function LessonContent({
  lesson,
  onPassQuiz,
  slug,
  submissions,
}: {
  lesson: Lesson;
  onPassQuiz: () => void;
  slug: string;
  submissions: Record<string, SubmissionView>;
}) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
        {lesson.type === "video" ? "Vidéo" : lesson.type === "quiz" ? "Quiz" : "Lecture"} · {lesson.durationMin} min
      </span>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>

      <div className="mt-6">
        {lesson.content.kind === "video" && <VideoView lesson={lesson} />}
        {lesson.content.kind === "texte" && <TexteView lesson={lesson} />}
        {lesson.content.kind === "quiz" && (
          <QuizView lesson={lesson} onPass={onPassQuiz} slug={slug} lessonId={lesson.id} submissions={submissions} />
        )}
      </div>
    </div>
  );
}

function VideoView({ lesson }: { lesson: Lesson }) {
  if (lesson.content.kind !== "video") return null;
  return (
    <div>
      <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <button
          type="button"
          aria-label="Lire la vidéo"
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-brand transition-transform group-hover:scale-110"
        >
          <Play className="ml-0.5 h-7 w-7 fill-current" />
        </button>
        <span className="absolute bottom-3 left-4 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {lesson.durationMin}:00
        </span>
        {/* Faux contrôles */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent px-4 pb-2 pt-8 text-white/90">
          <Play className="h-4 w-4" />
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-1/4 rounded-full bg-orange-500" />
          </div>
          <span className="text-xs">2:00 / {lesson.durationMin}:00</span>
          <Settings className="h-4 w-4" />
          <Maximize className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-5 leading-relaxed text-[var(--text-secondary)]">{lesson.content.intro}</p>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold">Chapitres</p>
        <ul className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border-subtle)]">
          {lesson.content.chapters.map((c) => (
            <li key={c.time} className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-secondary)]">
              <span className="font-mono text-xs text-orange-600">{c.time}</span>
              {c.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TexteView({ lesson }: { lesson: Lesson }) {
  if (lesson.content.kind !== "texte") return null;
  return (
    <article className="space-y-6">
      {lesson.content.sections.map((s) => (
        <section key={s.heading}>
          <h2 className="text-xl font-bold">{s.heading}</h2>
          {s.body.map((p, i) => (
            <p key={i} className="mt-2 leading-relaxed text-[var(--text-secondary)]">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}

function QuizView({
  lesson,
  onPass,
  slug,
  lessonId,
  submissions,
}: {
  lesson: Lesson;
  onPass: () => void;
  slug: string;
  lessonId: string;
  submissions: Record<string, SubmissionView>;
}) {
  const [quiz] = useState(() => normalizeQuizContent(lesson.content));
  const initAnswers = () => {
    const init: Record<string, unknown> = {};
    for (const ex of quiz.exercices) {
      init[ex.id] = isManualType(ex.type) && submissions[ex.id] ? submissions[ex.id].answer : emptyAnswer(ex);
    }
    return init;
  };
  const [answers, setAnswers] = useState<Record<string, unknown>>(initAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (quiz.exercices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center">
        <p className="text-sm font-semibold">Exercice en préparation</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Le concepteur n'a pas encore ajouté de questions à cette évaluation.
        </p>
      </div>
    );
  }

  const hasAuto = quiz.exercices.some((e) => !isManualType(e.type));
  // Quelque chose reste-t-il à soumettre ? (auto = rejouable ; manuel = si pas déjà soumis)
  const hasPendingAction = quiz.exercices.some((e) => !isManualType(e.type) || !submissions[e.id]);
  const graded = submitted ? gradeQuiz(quiz.exercices, answers) : null;
  const passed = graded ? graded.percent >= quiz.passScore : false;

  function submit() {
    // Persiste les réponses longues non encore soumises.
    const essays = quiz.exercices
      .filter((ex) => isManualType(ex.type) && !submissions[ex.id])
      .map((ex) => ({ exerciceId: ex.id, prompt: ex.prompt, answer: String(answers[ex.id] ?? "") }))
      .filter((e) => e.answer.trim());
    if (essays.length) {
      startTransition(() => {
        void submitEssays(slug, lessonId, essays);
      });
    }
    setSubmitted(true);
    const g = gradeQuiz(quiz.exercices, answers);
    if (!hasAuto || g.percent >= quiz.passScore) onPass();
  }

  return (
    <div>
      {quiz.intro && <p className="leading-relaxed text-[var(--text-secondary)]">{quiz.intro}</p>}

      <div className="mt-6 space-y-6">
        {quiz.exercices.map((ex: Exercice, qi) => {
          const res = graded?.results[ex.id];
          return (
            <fieldset key={ex.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
              <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
                <span>
                  Question {qi + 1} — {ex.prompt}
                </span>
                {submitted && res && (
                  res.correct ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Target className="h-4 w-4 text-orange-500" />
                  )
                )}
              </legend>
              <div className="mt-3">
                <ExercicePlayer
                  exercice={ex}
                  answer={answers[ex.id]}
                  onChange={(a) => setAnswers((prev) => ({ ...prev, [ex.id]: a }))}
                  submitted={submitted}
                  result={res}
                  submission={submissions[ex.id]}
                  slug={slug}
                  lessonId={lessonId}
                />
              </div>
              {submitted && res && ex.feedback && (
                <p className="mt-3 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                  {ex.feedback}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      {!submitted && hasPendingAction ? (
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          Valider mes réponses
        </button>
      ) : !submitted ? null : !hasAuto ? (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-green-500/30 bg-green-50 p-5 dark:bg-green-500/10">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="font-bold">Réponse envoyée</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Votre travail a été transmis au tuteur pour correction.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "mt-6 flex items-center gap-4 rounded-2xl border p-5",
            passed ? "border-green-500/30 bg-green-50 dark:bg-green-500/10" : "border-orange-500/30 bg-orange-50 dark:bg-orange-500/10"
          )}
        >
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white", passed ? "bg-green-500" : "bg-orange-500")}>
            {passed ? <CheckCircle2 className="h-6 w-6" /> : <Target className="h-6 w-6" />}
          </span>
          <div className="min-w-0">
            <p className="font-bold">
              {passed ? "Bravo, évaluation réussie !" : "Presque ! Réessayez."} {graded?.percent} %
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {passed ? "Cette leçon est validée." : `Le seuil de réussite est de ${quiz.passScore} %.`}
            </p>
          </div>
          {!passed && (
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers(initAnswers());
              }}
              className="ml-auto shrink-0 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold hover:border-orange-400"
            >
              Recommencer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
 *  Onglets
 * =========================================================== */
function LessonTab({ tab, lesson }: { tab: Tab; lesson: Lesson }) {
  if (tab === "Aperçu") {
    return (
      <div>
        <h3 className="font-semibold">Objectifs de la leçon</h3>
        <ul className="mt-3 space-y-2">
          {lesson.objectives.map((o) => (
            <li key={o} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              {o}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (tab === "Mes notes") return <NotesTab lessonId={lesson.id} />;
  if (tab === "Ressources") {
    return (
      <ul className="space-y-2">
        {lesson.resources.map((r) => (
          <li key={r.title}>
            <button className="flex w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm transition-colors hover:border-orange-300">
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-orange-500" /> {r.title}
              </span>
              <span className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                {r.type} · {r.size} <Download className="h-4 w-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }
  if (tab === "Transcript") {
    return (
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {lesson.content.kind === "video"
          ? lesson.content.intro + " " + lesson.content.transcript
          : "Le transcript est disponible pour les leçons vidéo."}
      </p>
    );
  }
  // Discussion
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center">
      <p className="text-sm font-semibold">Espace de discussion</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Posez vos questions à votre tuteur et à la communauté. (Bientôt disponible)
      </p>
    </div>
  );
}

function NotesTab({ lessonId }: { lessonId: string }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setValue(localStorage.getItem(`dhfc-notes-${lessonId}`) ?? "");
    } catch {}
    setSaved(false);
  }, [lessonId]);

  function save() {
    try {
      localStorage.setItem(`dhfc-notes-${lessonId}`, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        placeholder="Prenez vos notes sur cette leçon…"
        className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
      />
      <button
        onClick={save}
        className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600"
      >
        {saved ? <><Check className="h-4 w-4" /> Enregistré</> : "Enregistrer mes notes"}
      </button>
    </div>
  );
}
