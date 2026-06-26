"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ENROLLMENTS } from "@/lib/lms/data";
import { getCurriculum } from "@/lib/lms/curriculum";

type ProgressState = {
  completed: Record<string, true>;
  lastLesson: Record<string, string>;
};

type ProgressContextValue = {
  hydrated: boolean;
  isCompleted: (lessonId: string) => boolean;
  markComplete: (lessonId: string, slug?: string) => void;
  toggleComplete: (lessonId: string) => void;
  setLastLesson: (slug: string, lessonId: string) => void;
  getLastLesson: (slug: string) => string | null;
  courseProgress: (slug: string) => { completed: number; total: number; percent: number };
  overallCompleted: number;
};

const STORAGE_KEY = "dhfc-progress";
const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Construit l'état initial amorcé à partir des inscriptions (baseline). */
function seedState(): ProgressState {
  const completed: Record<string, true> = {};
  const lastLesson: Record<string, string> = {};

  for (const enrollment of ENROLLMENTS) {
    const curriculum = getCurriculum(enrollment.slug);
    if (!curriculum) continue;
    const count = Math.round((enrollment.baselineProgress / 100) * curriculum.totalLessons);
    curriculum.flat.slice(0, count).forEach((lesson) => {
      completed[lesson.id] = true;
    });
    if (enrollment.lastLessonId) lastLesson[enrollment.slug] = enrollment.lastLessonId;
  }

  return { completed, lastLesson };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>({ completed: {}, lastLesson: {} });
  const [hydrated, setHydrated] = useState(false);

  // Chargement / amorçage après montage (évite tout décalage d'hydratation).
  useEffect(() => {
    let initial: ProgressState;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      initial = raw ? (JSON.parse(raw) as ProgressState) : seedState();
    } catch {
      initial = seedState();
    }
    setState(initial);
    setHydrated(true);
  }, []);

  // Persistance.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const markComplete = useCallback((lessonId: string, slug?: string) => {
    setState((s) => ({
      completed: { ...s.completed, [lessonId]: true },
      lastLesson: slug ? { ...s.lastLesson, [slug]: lessonId } : s.lastLesson,
    }));
  }, []);

  const toggleComplete = useCallback((lessonId: string) => {
    setState((s) => {
      const next = { ...s.completed };
      if (next[lessonId]) delete next[lessonId];
      else next[lessonId] = true;
      return { ...s, completed: next };
    });
  }, []);

  const setLastLesson = useCallback((slug: string, lessonId: string) => {
    setState((s) => ({ ...s, lastLesson: { ...s.lastLesson, [slug]: lessonId } }));
  }, []);

  const value = useMemo<ProgressContextValue>(() => {
    const isCompleted = (lessonId: string) => Boolean(state.completed[lessonId]);

    const courseProgress = (slug: string) => {
      const curriculum = getCurriculum(slug);
      const total = curriculum?.totalLessons ?? 0;
      if (!hydrated) {
        // Avant hydratation : on s'appuie sur la baseline pour un rendu stable.
        const enrollment = ENROLLMENTS.find((e) => e.slug === slug);
        const percent = enrollment?.baselineProgress ?? 0;
        return { completed: Math.round((percent / 100) * total), total, percent };
      }
      const prefix = `${slug}__`;
      const completed = Object.keys(state.completed).filter((id) => id.startsWith(prefix)).length;
      const percent = total ? Math.round((completed / total) * 100) : 0;
      return { completed, total, percent };
    };

    return {
      hydrated,
      isCompleted,
      markComplete,
      toggleComplete,
      setLastLesson,
      getLastLesson: (slug: string) => state.lastLesson[slug] ?? null,
      courseProgress,
      overallCompleted: Object.keys(state.completed).length,
    };
  }, [state, hydrated, markComplete, toggleComplete, setLastLesson]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress doit être utilisé dans un <ProgressProvider>");
  return ctx;
}
