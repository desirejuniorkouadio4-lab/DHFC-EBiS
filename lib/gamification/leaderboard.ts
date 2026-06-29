import { prisma } from "@/lib/prisma";

/** Classement de cohorte par XP (§18.3). */

export type LeaderRow = {
  rank: number;
  userId: string;
  name: string;
  initials: string;
  xp: number;
  level: number;
  badges: number;
  isMe: boolean;
};

export type Leaderboard = { rows: LeaderRow[]; myRank: number | null };

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

/** Classement des apprenants des cohortes de l'utilisateur, ordonné par XP. */
export async function getCohortLeaderboard(userId: string): Promise<Leaderboard> {
  const myEnrollments = await prisma.enrollment.findMany({ where: { userId }, select: { cohortId: true } });
  const cohortIds = [...new Set(myEnrollments.map((e) => e.cohortId).filter((id): id is string => !!id))];
  if (cohortIds.length === 0) return { rows: [], myRank: null };

  const enrollments = await prisma.enrollment.findMany({
    where: { cohortId: { in: cohortIds }, user: { role: "APPRENANT" } },
    select: { user: { select: { id: true, firstName: true, lastName: true, xp: true, level: true } } },
  });

  const usersById = new Map<string, { id: string; firstName: string; lastName: string; xp: number; level: number }>();
  for (const e of enrollments) usersById.set(e.user.id, e.user);

  const userIds = [...usersById.keys()];
  const badgeCounts = await prisma.userBadge.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds } },
    _count: { _all: true },
  });
  const badgesByUser = new Map(badgeCounts.map((b) => [b.userId, b._count._all]));

  const sorted = [...usersById.values()].sort((a, b) => b.xp - a.xp || a.lastName.localeCompare(b.lastName));
  const rows: LeaderRow[] = sorted.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    name: `${u.firstName} ${u.lastName}`,
    initials: initials(u.firstName, u.lastName),
    xp: u.xp,
    level: u.level,
    badges: badgesByUser.get(u.id) ?? 0,
    isMe: u.id === userId,
  }));

  const myRank = rows.find((r) => r.isMe)?.rank ?? null;
  return { rows, myRank };
}
