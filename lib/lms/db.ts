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

/* ----------------------------------------------------------------
 *  Badges, statistiques et activité (dashboard / profil)
 * ---------------------------------------------------------------- */

export type BadgeView = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned: boolean;
};

/** Tous les badges + indicateur « obtenu » pour l'utilisateur. */
export async function getUserBadges(userId: string): Promise<BadgeView[]> {
  const [badges, earned] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);
  const earnedSet = new Set(earned.map((e) => e.badgeId));
  return badges.map((b) => ({
    slug: b.slug,
    name: b.name,
    description: b.description ?? "",
    icon: b.icon,
    rarity: b.rarity,
    earned: earnedSet.has(b.id),
  }));
}

export type UserStats = {
  hours: number;
  quizPassed: number;
  streak: number;
  badges: number;
};

/** Statistiques personnelles calculées depuis la base. */
export async function getUserStats(userId: string): Promise<UserStats> {
  const [completedLessons, quizPassed, badges, user] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { lesson: { select: { durationMin: true } } },
    }),
    prisma.lessonProgress.count({
      where: { userId, completed: true, lesson: { type: "QUIZ" } },
    }),
    prisma.userBadge.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { streak: true } }),
  ]);
  const minutes = completedLessons.reduce((acc, p) => acc + p.lesson.durationMin, 0);
  return {
    hours: Math.round(minutes / 60),
    quizPassed,
    streak: user?.streak ?? 0,
    badges,
  };
}

export type ActivityView = {
  type: "lesson" | "quiz" | "badge";
  label: string;
  at: Date;
};

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `Il y a ${Math.max(1, mins)} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.round(days / 7);
  return `Il y a ${weeks} sem.`;
}

/** Activité récente dérivée des leçons terminées et des badges obtenus. */
export async function getRecentActivity(
  userId: string
): Promise<(Omit<ActivityView, "at"> & { time: string })[]> {
  const [lessons, badges] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, completed: true, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 6,
      select: { completedAt: true, lesson: { select: { title: true, type: true } } },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      take: 3,
      select: { earnedAt: true, badge: { select: { name: true } } },
    }),
  ]);

  const events: ActivityView[] = [
    ...lessons.map((l) => ({
      type: (l.lesson.type === "QUIZ" ? "quiz" : "lesson") as "quiz" | "lesson",
      label:
        l.lesson.type === "QUIZ"
          ? `Quiz « ${l.lesson.title} » réussi`
          : `Leçon « ${l.lesson.title} » terminée`,
      at: l.completedAt as Date,
    })),
    ...badges.map((b) => ({
      type: "badge" as const,
      label: `Badge « ${b.badge.name} » obtenu`,
      at: b.earnedAt,
    })),
  ];

  return events
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6)
    .map((e) => ({ type: e.type, label: e.label, time: relativeTime(e.at) }));
}
