import "server-only";
import { prisma } from "@/lib/prisma";
import { normalizeQuizContent } from "@/lib/exercices/legacy";
import { TYPE_LABEL, type Exercice } from "@/lib/exercices/types";

/**
 * Nom de la catégorie automatique d'une leçon. Le parcours est ajouté en suffixe
 * pour distinguer des leçons homonymes (l'identité durable reste `lessonId`).
 */
export function categoryNameForLesson(lessonTitle: string, parcoursTitle?: string | null): string {
  const base = `Questions par défaut pour la Leçon : ${lessonTitle.trim() || "Sans titre"}`;
  return parcoursTitle?.trim() ? `${base} — ${parcoursTitle.trim()}` : base;
}

function labelOf(ex: Exercice): string {
  const p = (ex.prompt ?? "").trim();
  return (p || TYPE_LABEL[ex.type] || "Question").slice(0, 160);
}

/**
 * Range automatiquement les questions d'un quiz dans la catégorie de sa leçon
 * (§13.6). Idempotent : chaque exercice est upserté par (lessonId, exerciceId).
 *
 * - Crée/maj la catégorie au nom de la leçon, sans intervention du concepteur.
 * - N'EFFACE jamais les questions retirées du quiz : elles restent dans la
 *   banque (indépendance — réutilisables même si le quiz est supprimé).
 * Renvoie le nombre de questions synchronisées.
 */
export async function syncLessonQuizToBank(lessonId: string): Promise<number> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      title: true,
      type: true,
      content: true,
      module: { select: { parcours: { select: { title: true, discipline: { select: { name: true } } } } } },
    },
  });
  if (!lesson || lesson.type !== "QUIZ") return 0;

  const quiz = normalizeQuizContent(lesson.content);
  if (quiz.exercices.length === 0) return 0;

  const category = categoryNameForLesson(lesson.title, lesson.module.parcours.title);
  const discipline = lesson.module.parcours.discipline?.name ?? null;

  let n = 0;
  for (const ex of quiz.exercices) {
    await prisma.bankQuestion.upsert({
      where: { lessonId_sourceExerciceId: { lessonId, sourceExerciceId: ex.id } },
      update: { label: labelOf(ex), type: ex.type, category, discipline, data: ex as object },
      create: {
        label: labelOf(ex),
        type: ex.type,
        category,
        discipline,
        lessonId,
        sourceExerciceId: ex.id,
        data: ex as object,
      },
    });
    n++;
  }
  return n;
}
