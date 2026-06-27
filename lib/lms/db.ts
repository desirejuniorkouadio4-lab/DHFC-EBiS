import { prisma } from "@/lib/prisma";
import type { Curriculum, LessonContent, LessonType } from "./curriculum";

/**
 * Couche d'accès LMS (Server Components / actions → Prisma → Neon).
 * Remplace le curriculum mocké et le store localStorage par des données réelles
 * rattachées à l'utilisateur connecté.
 */

const TYPE_FR: Record<string, LessonType> = { VIDEO: "video", TEXTE: "texte", QUIZ: "quiz" };

const DEFAULT_OBJECTIVES = [
  "Comprendre les notions clés de la leçon",
  "Relier la théorie à votre pratique de classe",
  "Préparer la mise en œuvre avec vos élèves",
];
const DEFAULT_RESOURCES = [
  { title: "Fiche de synthèse", type: "PDF", size: "320 Ko" },
  { title: "Exemple de séquence", type: "PDF", size: "540 Ko" },
];

/** Curriculum complet d'un parcours (modules → leçons avec contenu) depuis la base. */
export async function getCurriculumDB(slug: string): Promise<Curriculum | null> {
  const parcours = await prisma.parcours.findUnique({
    where: { slug },
    select: {
      title: true,
      modules: {
        orderBy: { index: "asc" },
        select: {
          index: true,
          title: true,
          lessons: {
            orderBy: { index: "asc" },
            select: { id: true, title: true, type: true, durationMin: true, content: true },
          },
        },
      },
    },
  });
  if (!parcours) return null;

  const modules = parcours.modules.map((m) => ({
    index: m.index,
    title: m.title,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: TYPE_FR[l.type] ?? "texte",
      durationMin: l.durationMin,
      moduleIndex: m.index,
      moduleTitle: m.title,
      objectives: DEFAULT_OBJECTIVES,
      content: (l.content ?? { kind: "texte", sections: [] }) as unknown as LessonContent,
      resources: DEFAULT_RESOURCES,
    })),
  }));

  const flat = modules.flatMap((m) => m.lessons);
  return { slug, title: parcours.title, modules, flat, totalLessons: flat.length };
}

/** Ids des leçons terminées par un utilisateur pour un parcours donné. */
export async function getCompletedLessonIds(userId: string, slug: string): Promise<string[]> {
  const rows = await prisma.lessonProgress.findMany({
    where: { userId, completed: true, lesson: { module: { parcours: { slug } } } },
    select: { lessonId: true },
  });
  return rows.map((r) => r.lessonId);
}

export type EnrollmentView = {
  slug: string;
  title: string;
  subtitle: string;
  disciplineSlug: string;
  cohort: string | null;
  tutor: string | null;
  tutorInitials: string;
  completed: number;
  total: number;
  percent: number;
  resumeLessonId: string;
  currentLessonLabel: string;
};

function initialsOf(name: string | null): string {
  if (!name) return "··";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Inscriptions de l'utilisateur avec progression réelle + leçon de reprise. */
export async function getMyEnrollments(userId: string): Promise<EnrollmentView[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "asc" },
    select: {
      tutorName: true,
      cohort: { select: { name: true } },
      parcours: {
        select: {
          slug: true,
          title: true,
          subtitle: true,
          discipline: { select: { slug: true } },
          modules: {
            orderBy: { index: "asc" },
            select: { title: true, lessons: { orderBy: { index: "asc" }, select: { id: true, title: true } } },
          },
        },
      },
    },
  });

  const completedRows = await prisma.lessonProgress.findMany({
    where: { userId, completed: true },
    select: { lessonId: true },
  });
  const completedSet = new Set(completedRows.map((r) => r.lessonId));

  return enrollments.map((e) => {
    const flat = e.parcours.modules.flatMap((m) =>
      m.lessons.map((l) => ({ id: l.id, title: l.title, moduleTitle: m.title }))
    );
    const total = flat.length;
    const completed = flat.filter((l) => completedSet.has(l.id)).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const resume = flat.find((l) => !completedSet.has(l.id)) ?? flat[0];

    return {
      slug: e.parcours.slug,
      title: e.parcours.title,
      subtitle: e.parcours.subtitle,
      disciplineSlug: e.parcours.discipline.slug,
      cohort: e.cohort?.name ?? null,
      tutor: e.tutorName,
      tutorInitials: initialsOf(e.tutorName),
      completed,
      total,
      percent,
      resumeLessonId: resume?.id ?? "",
      currentLessonLabel: resume ? `${resume.moduleTitle} · ${resume.title}` : "",
    };
  });
}

/** Leçon de reprise (première non terminée) pour la redirection /apprendre/[slug]. */
export async function getResumeLessonId(userId: string, slug: string): Promise<string | null> {
  const curriculum = await getCurriculumDB(slug);
  if (!curriculum || curriculum.flat.length === 0) return null;
  const completed = new Set(await getCompletedLessonIds(userId, slug));
  const resume = curriculum.flat.find((l) => !completed.has(l.id)) ?? curriculum.flat[0];
  return resume.id;
}
