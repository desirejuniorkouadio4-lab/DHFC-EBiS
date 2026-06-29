import "server-only";
import { prisma } from "@/lib/prisma";
import { normalizeCompletion } from "./types";
import { evaluateCompletion, effectiveLock, type CompletionSignals } from "./engine";
import { syncEnrollmentProgress } from "@/lib/lms/progress";
import { issueCertificateIfComplete } from "@/lib/certificates/issue";
import { awardXp, XP } from "@/lib/gamification/xp";
import { evaluateBadges } from "@/lib/gamification/badges";

/** Mode d'achèvement configuré pour une leçon. */
export async function lessonCompletionMode(lessonId: string): Promise<"none" | "manual" | "auto"> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { completion: true } });
  return normalizeCompletion(lesson?.completion).mode;
}

/**
 * La leçon est-elle accessible à l'apprenant (restrictions module + leçon satisfaites) ?
 * Empêche de valider/ouvrir une activité verrouillée côté serveur.
 */
export async function isLessonAccessible(userId: string, lessonId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { access: true, module: { select: { access: true, parcours: { select: { slug: true } } } } },
  });
  if (!lesson) return true;
  const slug = lesson.module.parcours.slug;
  const rows = await prisma.lessonProgress.findMany({
    where: { userId, completed: true, lesson: { module: { parcours: { slug } } } },
    select: { lessonId: true },
  });
  const completed = new Set(rows.map((r) => r.lessonId));
  return !effectiveLock(lesson.module.access, lesson.access, completed).locked;
}

/** Collecte les signaux d'achèvement d'un apprenant pour une leçon. */
export async function gatherSignals(userId: string, lessonId: string): Promise<CompletionSignals> {
  const [progress, submissions] = await Promise.all([
    prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { viewedAt: true, score: true },
    }),
    prisma.submission.findMany({
      where: { userId, lessonId },
      select: { status: true, score: true, maxScore: true },
    }),
  ]);

  const quizScore = progress?.score ?? null; // % auto-corrigé
  const gradedSubs = submissions.filter((s) => s.status === "GRADED" && s.score !== null);
  const bestSubPct = gradedSubs.length
    ? Math.max(...gradedSubs.map((s) => Math.round(((s.score ?? 0) / (s.maxScore || 20)) * 100)))
    : null;
  const scores = [quizScore, bestSubPct].filter((v): v is number => v !== null);

  return {
    viewed: !!progress?.viewedAt,
    submitted: quizScore !== null || submissions.length > 0,
    graded: quizScore !== null || gradedSubs.length > 0,
    score: scores.length ? Math.max(...scores) : null,
  };
}

/**
 * Recalcule l'achèvement AUTOMATIQUE d'une leçon et le persiste.
 * No-op pour les leçons en mode manuel / none (gérées par l'apprenant).
 * Renvoie l'état `completed` effectif.
 */
export async function recomputeAutoCompletion(userId: string, slug: string, lessonId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { completion: true } });
  const rule = normalizeCompletion(lesson?.completion);
  if (rule.mode !== "auto") {
    const cur = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { completed: true },
    });
    return !!cur?.completed;
  }

  const signals = await gatherSignals(userId, lessonId);
  const shouldComplete = evaluateCompletion(rule, signals, false) === "complete";

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { completed: true },
  });
  if (existing?.completed === shouldComplete) return shouldComplete;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: shouldComplete, completedAt: shouldComplete ? new Date() : null },
    create: { userId, lessonId, completed: shouldComplete, completedAt: shouldComplete ? new Date() : null },
  });

  const percent = await syncEnrollmentProgress(userId, slug);
  if (shouldComplete && !existing?.completed) {
    await awardXp(userId, XP.lesson);
    await evaluateBadges(userId);
    if (percent >= 100) await issueCertificateIfComplete(userId, slug);
  }
  return shouldComplete;
}
