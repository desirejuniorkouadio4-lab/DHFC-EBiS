import { prisma } from "@/lib/prisma";

/** Agrégations pour le tableau de bord analytique admin (§17.1). */

const WEEK = 7 * 86400000;

export type Point = { label: string; value: number };
export type Analytics = {
  activityByWeek: Point[]; // leçons terminées par semaine (8 dernières)
  roleDistribution: Point[];
  parcoursCompletion: Point[]; // complétion moyenne par parcours
  totals: { weekActivity: number; avgCompletion: number };
};

const ROLE_FR: Record<string, string> = {
  APPRENANT: "Apprenants",
  TUTEUR: "Tuteurs",
  ENCADREUR: "Encadreurs",
  CONCEPTEUR: "Concepteurs",
  ADMIN: "Admins",
  SUPERADMIN: "Super-admins",
};

export async function getAnalytics(): Promise<Analytics> {
  const since = new Date(Date.now() - 8 * WEEK);
  const [progress, roleGroups, parcours, completion] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { completed: true, completedAt: { gte: since } },
      select: { completedAt: true },
    }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.parcours.findMany({ select: { title: true, enrollments: { select: { progress: true } } } }),
    prisma.enrollment.aggregate({ _avg: { progress: true } }),
  ]);

  // Activité par semaine (index 0 = cette semaine … 7 = il y a 7 semaines).
  const buckets = new Array(8).fill(0);
  for (const p of progress) {
    if (!p.completedAt) continue;
    const wAgo = Math.floor((Date.now() - p.completedAt.getTime()) / WEEK);
    if (wAgo >= 0 && wAgo < 8) buckets[wAgo]++;
  }
  const activityByWeek: Point[] = buckets
    .map((value, i) => ({ label: i === 0 ? "Cette sem." : `S-${i}`, value }))
    .reverse();

  const roleDistribution: Point[] = roleGroups
    .map((g) => ({ label: ROLE_FR[g.role] ?? g.role, value: g._count._all }))
    .sort((a, b) => b.value - a.value);

  const parcoursCompletion: Point[] = parcours
    .filter((p) => p.enrollments.length > 0)
    .map((p) => ({
      label: p.title,
      value: Math.round(p.enrollments.reduce((a, e) => a + e.progress, 0) / p.enrollments.length),
    }))
    .sort((a, b) => b.value - a.value);

  return {
    activityByWeek,
    roleDistribution,
    parcoursCompletion,
    totals: {
      weekActivity: buckets[0],
      avgCompletion: Math.round(completion._avg.progress ?? 0),
    },
  };
}
