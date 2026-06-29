import { prisma } from "@/lib/prisma";

/**
 * Vue de supervision de l'encadreur (§16.3).
 * Vue d'ensemble du dispositif + comparaison entre tuteurs (taux de complétion,
 * apprenants en difficulté, devoirs en attente).
 */

const SEVEN_DAYS = 7 * 86400000;

export type TutorComparison = {
  tutorId: string;
  tutorName: string;
  cohortsCount: number;
  learnersCount: number;
  avgCompletion: number;
  inactiveCount: number;
  pendingCorrections: number;
};

export type EncadreurOverview = {
  totalLearners: number;
  avgCompletion: number;
  activeLast7d: number;
  pendingCorrections: number;
  cohortsCount: number;
  tutorsCount: number;
  unassignedCohorts: number;
  tutors: TutorComparison[];
};

export async function getEncadreurOverview(): Promise<EncadreurOverview> {
  const [cohorts, pendingSubs] = await Promise.all([
    prisma.cohort.findMany({
      select: {
        id: true,
        tutorId: true,
        tutor: { select: { firstName: true, lastName: true } },
        enrollments: { select: { userId: true, progress: true } },
      },
    }),
    prisma.submission.findMany({
      where: { status: "PENDING" },
      select: { cohort: { select: { tutorId: true } } },
    }),
  ]);

  // Dernière activité par apprenant.
  const allUserIds = [...new Set(cohorts.flatMap((c) => c.enrollments.map((e) => e.userId)))];
  const lastActivity = await lastActivityByUser(allUserIds);
  const isInactive = (uid: string) => {
    const d = lastActivity.get(uid);
    return !d || Date.now() - d.getTime() > SEVEN_DAYS;
  };

  // Corrections en attente par tuteur.
  const pendingByTutor = new Map<string, number>();
  let pendingTotal = 0;
  for (const s of pendingSubs) {
    pendingTotal += 1;
    const t = s.cohort?.tutorId;
    if (t) pendingByTutor.set(t, (pendingByTutor.get(t) ?? 0) + 1);
  }

  // Agrégats globaux.
  const globalLearners = new Set<string>();
  const activeLearners = new Set<string>();
  let progressSum = 0;
  let progressCount = 0;

  // Agrégats par tuteur.
  type Acc = {
    name: string;
    cohorts: number;
    learners: Set<string>;
    progressSum: number;
    progressCount: number;
  };
  const byTutor = new Map<string, Acc>();
  let unassignedCohorts = 0;

  for (const c of cohorts) {
    if (!c.tutorId) unassignedCohorts += 1;
    const acc = c.tutorId
      ? byTutor.get(c.tutorId) ??
        (() => {
          const a: Acc = {
            name: c.tutor ? `${c.tutor.firstName} ${c.tutor.lastName}` : "—",
            cohorts: 0,
            learners: new Set<string>(),
            progressSum: 0,
            progressCount: 0,
          };
          byTutor.set(c.tutorId!, a);
          return a;
        })()
      : null;
    if (acc) acc.cohorts += 1;

    for (const e of c.enrollments) {
      globalLearners.add(e.userId);
      if (!isInactive(e.userId)) activeLearners.add(e.userId);
      progressSum += e.progress;
      progressCount += 1;
      if (acc) {
        acc.learners.add(e.userId);
        acc.progressSum += e.progress;
        acc.progressCount += 1;
      }
    }
  }

  const tutors: TutorComparison[] = [...byTutor.entries()]
    .map(([tutorId, a]) => ({
      tutorId,
      tutorName: a.name,
      cohortsCount: a.cohorts,
      learnersCount: a.learners.size,
      avgCompletion: a.progressCount ? Math.round(a.progressSum / a.progressCount) : 0,
      inactiveCount: [...a.learners].filter((uid) => isInactive(uid)).length,
      pendingCorrections: pendingByTutor.get(tutorId) ?? 0,
    }))
    .sort((x, y) => y.avgCompletion - x.avgCompletion);

  return {
    totalLearners: globalLearners.size,
    avgCompletion: progressCount ? Math.round(progressSum / progressCount) : 0,
    activeLast7d: activeLearners.size,
    pendingCorrections: pendingTotal,
    cohortsCount: cohorts.length,
    tutorsCount: byTutor.size,
    unassignedCohorts,
    tutors,
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
