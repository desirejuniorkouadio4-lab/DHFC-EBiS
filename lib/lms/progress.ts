import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Recalcule et enregistre le pourcentage de progression d'une inscription
 * (part des leçons « achevées » du parcours). Source de vérité partagée par
 * les actions LMS et le moteur d'achèvement automatique.
 */
export async function syncEnrollmentProgress(userId: string, slug: string): Promise<number> {
  const total = await prisma.lesson.count({ where: { module: { parcours: { slug } } } });
  const completed = await prisma.lessonProgress.count({
    where: { userId, completed: true, lesson: { module: { parcours: { slug } } } },
  });
  const percent = total ? Math.round((completed / total) * 100) : 0;
  await prisma.enrollment.updateMany({ where: { userId, parcours: { slug } }, data: { progress: percent } });
  return percent;
}

/** Slug du parcours auquel appartient une leçon (pour le revalidate / la cohorte). */
export async function parcoursSlugOfLesson(lessonId: string): Promise<string | null> {
  const l = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { parcours: { select: { slug: true } } } } },
  });
  return l?.module.parcours.slug ?? null;
}
