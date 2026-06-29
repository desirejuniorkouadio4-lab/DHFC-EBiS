"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { issueCertificateIfComplete } from "@/lib/certificates/issue";
import { awardXp, XP } from "@/lib/gamification/xp";
import { evaluateBadges } from "@/lib/gamification/badges";

/** Recalcule et enregistre le pourcentage de progression d'une inscription. */
async function syncEnrollmentProgress(userId: string, slug: string) {
  const total = await prisma.lesson.count({
    where: { module: { parcours: { slug } } },
  });
  const completed = await prisma.lessonProgress.count({
    where: { userId, completed: true, lesson: { module: { parcours: { slug } } } },
  });
  const percent = total ? Math.round((completed / total) * 100) : 0;

  await prisma.enrollment.updateMany({
    where: { userId, parcours: { slug } },
    data: { progress: percent },
  });
  return percent;
}

/**
 * Bascule l'état « terminé » d'une leçon pour l'utilisateur connecté,
 * met à jour la progression de l'inscription, puis revalide les pages LMS.
 */
export async function toggleLessonComplete(slug: string, lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, completed: false };
  const userId = session.user.id;

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const nowCompleted = !existing?.completed;
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

  revalidatePath("/tableau-de-bord");
  revalidatePath("/mes-parcours");
  revalidatePath("/certificats");
  revalidatePath(`/apprendre/${slug}`, "layout");

  return { ok: true, completed: nowCompleted };
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

  // Cohorte de l'apprenant pour ce parcours (pour router la correction au bon tuteur).
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, parcours: { slug } },
    select: { cohortId: true },
  });

  for (const e of essays) {
    if (!e.answer.trim()) continue;
    await prisma.submission.upsert({
      where: { userId_lessonId_exerciceId: { userId, lessonId, exerciceId: e.exerciceId } },
      update: {}, // ne pas écraser une soumission existante (ni sa correction)
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
  revalidatePath(`/apprendre/${slug}`, "layout");
}

/** Marque une leçon comme terminée (idempotent) — utilisé sur « Suivant ». */
export async function markLessonComplete(slug: string, lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const userId = session.user.id;

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
  revalidatePath("/tableau-de-bord");
  revalidatePath("/mes-parcours");
  revalidatePath("/certificats");
  return { ok: true };
}

/** Vérifie les badges liés au quiz (quiz parfait) à la soumission. */
export async function recordQuizResult(percent: number): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await evaluateBadges(session.user.id, { quizPerfect: percent >= 100 });
  revalidatePath("/tableau-de-bord");
}
