"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  await syncEnrollmentProgress(userId, slug);

  revalidatePath("/tableau-de-bord");
  revalidatePath("/mes-parcours");
  revalidatePath(`/apprendre/${slug}`, "layout");

  return { ok: true, completed: nowCompleted };
}

/** Marque une leçon comme terminée (idempotent) — utilisé sur « Suivant ». */
export async function markLessonComplete(slug: string, lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const userId = session.user.id;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: true, completedAt: new Date() },
    create: { userId, lessonId, completed: true, completedAt: new Date() },
  });

  await syncEnrollmentProgress(userId, slug);
  revalidatePath("/tableau-de-bord");
  revalidatePath("/mes-parcours");
  return { ok: true };
}
