import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth-helpers";

/**
 * Couche d'accès du tableau de bord tuteur / encadreur (§16).
 * Un TUTEUR ne voit que les cohortes dont il est le tuteur attitré ;
 * ENCADREUR / ADMIN / SUPERADMIN voient toutes les cohortes.
 */

function canSeeAll(role: string): boolean {
  return role === "ENCADREUR" || role === "ADMIN" || role === "SUPERADMIN";
}

export type LearnerStatus = "termine" | "inactif" | "en-difficulte" | "en-cours";

export function statusOf(progress: number, lastActivity: Date | null): LearnerStatus {
  if (progress >= 100) return "termine";
  const days = lastActivity ? (Date.now() - lastActivity.getTime()) / 86400000 : Infinity;
  if (days > 7) return "inactif";
  if (progress < 25) return "en-difficulte";
  return "en-cours";
}

export type CohortCard = {
  id: string;
  name: string;
  learnerCount: number;
  avgProgress: number;
  parcoursCount: number;
  toWatch: number; // apprenants inactifs ou en difficulté
};

/** Cohortes visibles par l'utilisateur (tuteur : les siennes ; sinon toutes). */
export async function getTutorCohorts(actor: SessionUser): Promise<CohortCard[]> {
  const cohorts = await prisma.cohort.findMany({
    where: canSeeAll(actor.role) ? {} : { tutorId: actor.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      enrollments: { select: { userId: true, parcoursId: true, progress: true } },
    },
  });

  // Dernière activité par apprenant (sur l'ensemble des cohortes visibles).
  const userIds = [...new Set(cohorts.flatMap((c) => c.enrollments.map((e) => e.userId)))];
  const lastActivity = await lastActivityByUser(userIds);

  return cohorts.map((c) => {
    const learners = new Map<string, number[]>();
    for (const e of c.enrollments) {
      const arr = learners.get(e.userId) ?? [];
      arr.push(e.progress);
      learners.set(e.userId, arr);
    }
    const progresses = [...learners.values()].map((arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length));
    const avgProgress = progresses.length ? Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) : 0;
    let toWatch = 0;
    for (const [uid, arr] of learners) {
      const p = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      const st = statusOf(p, lastActivity.get(uid) ?? null);
      if (st === "inactif" || st === "en-difficulte") toWatch += 1;
    }
    return {
      id: c.id,
      name: c.name,
      learnerCount: learners.size,
      avgProgress,
      parcoursCount: new Set(c.enrollments.map((e) => e.parcoursId)).size,
      toWatch,
    };
  });
}

export type CohortLearner = {
  id: string;
  name: string;
  initials: string;
  college: string | null;
  region: string | null;
  progress: number;
  completedLessons: number;
  parcours: { title: string; short: string; color: string }[];
  lastActivity: Date | null;
  status: LearnerStatus;
};

export type CohortDetail = {
  id: string;
  name: string;
  learners: CohortLearner[];
  stats: { count: number; avgProgress: number; inactive: number; atRisk: number; finished: number };
};

/** Détail d'une cohorte pour le tuteur (table des apprenants + stats), ou null si non autorisé. */
export async function getCohortForTutor(cohortId: string, actor: SessionUser): Promise<CohortDetail | null> {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    select: {
      id: true,
      name: true,
      tutorId: true,
      enrollments: {
        select: {
          progress: true,
          user: { select: { id: true, firstName: true, lastName: true, college: true, region: true } },
          parcours: { select: { title: true, discipline: { select: { short: true, color: true } } } },
        },
      },
    },
  });
  if (!cohort) return null;
  if (!canSeeAll(actor.role) && cohort.tutorId !== actor.id) return null;

  const userIds = [...new Set(cohort.enrollments.map((e) => e.user.id))];
  const [lastActivity, completedByUser] = await Promise.all([
    lastActivityByUser(userIds),
    completedLessonsByUser(userIds),
  ]);

  // Regroupe par apprenant (un apprenant peut avoir plusieurs inscriptions dans la cohorte).
  const byUser = new Map<string, CohortLearner>();
  for (const e of cohort.enrollments) {
    const u = e.user;
    const existing = byUser.get(u.id);
    const parcoursEntry = { title: e.parcours.title, short: e.parcours.discipline.short, color: e.parcours.discipline.color };
    if (existing) {
      existing.parcours.push(parcoursEntry);
      existing.progress = Math.round((existing.progress + e.progress) / 2);
    } else {
      byUser.set(u.id, {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        initials: `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase(),
        college: u.college,
        region: u.region,
        progress: e.progress,
        completedLessons: completedByUser.get(u.id) ?? 0,
        parcours: [parcoursEntry],
        lastActivity: lastActivity.get(u.id) ?? null,
        status: "en-cours",
      });
    }
  }

  const learners = [...byUser.values()].map((l) => ({ ...l, status: statusOf(l.progress, l.lastActivity) }));
  learners.sort((a, b) => a.progress - b.progress); // les plus en difficulté en haut

  const count = learners.length;
  const avgProgress = count ? Math.round(learners.reduce((a, l) => a + l.progress, 0) / count) : 0;
  return {
    id: cohort.id,
    name: cohort.name,
    learners,
    stats: {
      count,
      avgProgress,
      inactive: learners.filter((l) => l.status === "inactif").length,
      atRisk: learners.filter((l) => l.status === "en-difficulte").length,
      finished: learners.filter((l) => l.status === "termine").length,
    },
  };
}

async function lastActivityByUser(userIds: string[]): Promise<Map<string, Date>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.lessonProgress.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, completed: true, completedAt: { not: null } },
    _max: { completedAt: true },
  });
  return new Map(rows.filter((r) => r._max.completedAt).map((r) => [r.userId, r._max.completedAt as Date]));
}

async function completedLessonsByUser(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.lessonProgress.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, completed: true },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.userId, r._count._all]));
}
