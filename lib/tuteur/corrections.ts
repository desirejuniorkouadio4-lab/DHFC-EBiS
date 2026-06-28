import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth-helpers";
import { normalizeQuizContent } from "@/lib/exercices/legacy";

/**
 * File de correction du tuteur (§16.2).
 * Un TUTEUR ne voit que les soumissions des cohortes dont il est le tuteur ;
 * ENCADREUR / ADMIN / SUPERADMIN voient toutes les soumissions.
 */

function canSeeAll(role: string): boolean {
  return role === "ENCADREUR" || role === "ADMIN" || role === "SUPERADMIN";
}

function scopeWhere(actor: SessionUser) {
  return canSeeAll(actor.role) ? {} : { cohort: { tutorId: actor.id } };
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

export type SubmissionListItem = {
  id: string;
  learnerName: string;
  initials: string;
  cohortName: string | null;
  parcoursTitle: string;
  lessonTitle: string;
  prompt: string;
  status: "PENDING" | "GRADED";
  score: number | null;
  maxScore: number;
  createdAt: Date;
};

/** Nombre de devoirs en attente de correction (badge du dashboard). */
export async function getPendingCount(actor: SessionUser): Promise<number> {
  return prisma.submission.count({ where: { status: "PENDING", ...scopeWhere(actor) } });
}

/** Liste des soumissions visibles, filtrées par statut. */
export async function getSubmissionsForTutor(
  actor: SessionUser,
  status: "PENDING" | "GRADED" | "ALL" = "PENDING"
): Promise<SubmissionListItem[]> {
  const rows = await prisma.submission.findMany({
    where: {
      ...scopeWhere(actor),
      ...(status !== "ALL" ? { status } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      prompt: true,
      status: true,
      score: true,
      maxScore: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true } },
      cohort: { select: { name: true } },
      lesson: { select: { title: true, module: { select: { parcours: { select: { title: true } } } } } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    learnerName: `${r.user.firstName} ${r.user.lastName}`,
    initials: initials(`${r.user.firstName} ${r.user.lastName}`),
    cohortName: r.cohort?.name ?? null,
    parcoursTitle: r.lesson.module.parcours.title,
    lessonTitle: r.lesson.title,
    prompt: r.prompt,
    status: r.status,
    score: r.score,
    maxScore: r.maxScore,
    createdAt: r.createdAt,
  }));
}

export type SubmissionDetail = {
  id: string;
  learnerName: string;
  initials: string;
  college: string | null;
  cohortName: string | null;
  parcoursTitle: string;
  lessonTitle: string;
  prompt: string;
  answer: string;
  rubric: string;
  status: "PENDING" | "GRADED";
  score: number | null;
  maxScore: number;
  feedback: string | null;
};

/** Détail d'une soumission pour la correction, ou null si non autorisé. */
export async function getSubmissionForTutor(id: string, actor: SessionUser): Promise<SubmissionDetail | null> {
  const s = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      exerciceId: true,
      prompt: true,
      answer: true,
      status: true,
      score: true,
      maxScore: true,
      feedback: true,
      cohort: { select: { name: true, tutorId: true } },
      user: { select: { firstName: true, lastName: true, college: true } },
      lesson: { select: { title: true, content: true, module: { select: { parcours: { select: { title: true } } } } } },
    },
  });
  if (!s) return null;
  if (!canSeeAll(actor.role) && s.cohort?.tutorId !== actor.id) return null;

  // Grille de notation : extraite du contenu de la leçon (exercice correspondant).
  let rubric = "";
  const quiz = normalizeQuizContent(s.lesson.content);
  const ex = quiz.exercices.find((e) => e.id === s.exerciceId);
  if (ex && ex.type === "REPONSE_LONGUE") rubric = ex.data.rubric;

  const name = `${s.user.firstName} ${s.user.lastName}`;
  return {
    id: s.id,
    learnerName: name,
    initials: initials(name),
    college: s.user.college,
    cohortName: s.cohort?.name ?? null,
    parcoursTitle: s.lesson.module.parcours.title,
    lessonTitle: s.lesson.title,
    prompt: s.prompt,
    answer: s.answer,
    rubric,
    status: s.status,
    score: s.score,
    maxScore: s.maxScore,
    feedback: s.feedback,
  };
}
