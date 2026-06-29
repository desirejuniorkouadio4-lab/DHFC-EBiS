"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { issueCertificateIfComplete } from "@/lib/certificates/issue";
import { syncEnrollmentProgress } from "@/lib/lms/progress";
import {
  recomputeAutoCompletion,
  isLessonAccessible,
  lessonCompletionMode,
} from "@/lib/completion/recompute";
import { awardXp, XP } from "@/lib/gamification/xp";
import { evaluateBadges } from "@/lib/gamification/badges";

function revalidateLms(slug: string) {
  revalidatePath("/tableau-de-bord");
  revalidatePath("/mes-parcours");
  revalidatePath("/certificats");
  revalidatePath(`/apprendre/${slug}`, "layout");
}

/**
 * Bascule l'état « terminé » d'une leçon (achèvement MANUEL) pour l'utilisateur
 * connecté. Refuse si l'activité est verrouillée (restriction d'accès) ou si elle
 * est en achèvement automatique (l'apprenant ne coche pas lui-même).
 */
export async function toggleLessonComplete(slug: string, lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, completed: false };
  const userId = session.user.id;

  const mode = await lessonCompletionMode(lessonId);
  if (mode === "auto" || mode === "none") {
    const cur = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { completed: true },
    });
    return { ok: false, completed: !!cur?.completed };
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  const nowCompleted = !existing?.completed;

  // On ne peut pas valider une activité verrouillée.
  if (nowCompleted && !(await isLessonAccessible(userId, lessonId))) {
    return { ok: false, completed: false };
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: nowCompleted, completedAt: nowCompleted ? new Date() : null },
    create: { userId, lessonId, completed: nowCompleted, completedAt: nowCompleted ? new Date() : null },
  });

  const percent = await syncEnrollmentProgress(userId, slug);
  if (percent >= 100) await issueCertificateIfComplete(userId, slug);
  if (nowCompleted) {
    await awardXp(userId, XP.lesson);
    await evaluateBadges(userId);
  }

  revalidateLms(slug);
  return { ok: true, completed: nowCompleted };
}

/**
 * Marque une leçon terminée (idempotent) — utilisé sur « Suivant » / réussite quiz.
 * N'agit que pour les leçons en achèvement MANUEL et déverrouillées ; les leçons
 * automatiques sont pilotées par le moteur de recalcul.
 */
export async function markLessonComplete(slug: string, lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const userId = session.user.id;

  const mode = await lessonCompletionMode(lessonId);
  if (mode !== "manual") return { ok: false }; // auto/none : pas de marquage manuel
  if (!(await isLessonAccessible(userId, lessonId))) return { ok: false };

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { completed: true },
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId, lessonId, completed: true, completedAt: new Date() },
  });

  const percent = await syncEnrollmentProgress(userId, slug);
  if (percent >= 100) await issueCertificateIfComplete(userId, slug);
  if (!existing?.completed) {
    await awardXp(userId, XP.lesson);
    await evaluateBadges(userId);
  }
  revalidateLms(slug);
  return { ok: true };
}

/**
 * Enregistre l'ouverture d'une leçon (condition d'achèvement « vue ») puis
 * recalcule l'achèvement automatique.
 */
export async function recordLessonView(slug: string, lessonId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const userId = session.user.id;
  if (!(await isLessonAccessible(userId, lessonId))) return;

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { viewedAt: true },
  });
  if (!existing?.viewedAt) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { viewedAt: new Date() },
      create: { userId, lessonId, viewedAt: new Date() },
    });
  }
  const changed = await recomputeAutoCompletion(userId, slug, lessonId);
  if (changed) revalidateLms(slug);
}

/**
 * Persiste les réponses longues d'une leçon (file de correction tuteur).
 * N'écrase jamais une soumission déjà existante (préserve une correction).
 */
export async function submitEssays(
  slug: string,
  lessonId: string,
  essays: { exerciceId: string; prompt: string; answer: string }[]
) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const userId = session.user.id;

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, parcours: { slug } },
    select: { cohortId: true },
  });

  for (const e of essays) {
    if (!e.answer.trim()) continue;
    await prisma.submission.upsert({
      where: { userId_lessonId_exerciceId: { userId, lessonId, exerciceId: e.exerciceId } },
      update: {},
      create: {
        userId,
        lessonId,
        exerciceId: e.exerciceId,
        prompt: e.prompt.slice(0, 1000),
        answer: e.answer,
        cohortId: enrollment?.cohortId ?? null,
        status: "PENDING",
      },
    });
  }
  // Signal « soumis » → recalcul de l'achèvement automatique.
  await recomputeAutoCompletion(userId, slug, lessonId);
  revalidatePath(`/apprendre/${slug}`, "layout");
  return { ok: true };
}

/**
 * Dépose le fichier d'un exercice « dépôt de devoir » (file de correction tuteur).
 * N'écrase pas un dépôt existant.
 */
export async function submitAssignmentUrl(
  slug: string,
  lessonId: string,
  exerciceId: string,
  prompt: string,
  data: { url: string }
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const userId = session.user.id;
  if (!data?.url || !/^(https?:\/\/|\/uploads\/)/.test(data.url)) return;

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, parcours: { slug } },
    select: { cohortId: true },
  });

  await prisma.submission.upsert({
    where: { userId_lessonId_exerciceId: { userId, lessonId, exerciceId } },
    update: {},
    create: {
      userId,
      lessonId,
      exerciceId,
      prompt: prompt.slice(0, 1000),
      answer: data.url,
      cohortId: enrollment?.cohortId ?? null,
      status: "PENDING",
    },
  });
  await recomputeAutoCompletion(userId, slug, lessonId);
  revalidatePath(`/apprendre/${slug}`, "layout");
}

/**
 * Enregistre le résultat d'un quiz auto-corrigé : conserve la meilleure note,
 * vérifie les badges, puis recalcule l'achèvement automatique (note / réussite).
 */
export async function recordQuizResult(slug: string, lessonId: string, percent: number): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const userId = session.user.id;
  const pct = Math.max(0, Math.min(100, Math.round(percent)));

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { score: true },
  });
  const best = Math.max(pct, existing?.score ?? 0);
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { score: best },
    create: { userId, lessonId, score: best },
  });

  await evaluateBadges(userId, { quizPerfect: pct >= 100 });
  await recomputeAutoCompletion(userId, slug, lessonId);
  revalidateLms(slug);
}
