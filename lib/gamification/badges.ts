import { prisma } from "@/lib/prisma";

/**
 * Moteur de règles de badges (§18.2) — attribution automatique déclenchée
 * par les événements (leçon terminée, certificat, post forum, quiz parfait).
 */

export type BadgeContext = { quizPerfect?: boolean };

/** Évalue les règles et attribue les badges nouvellement mérités. Renvoie leurs slugs. */
export async function evaluateBadges(userId: string, ctx: BadgeContext = {}): Promise<string[]> {
  const [user, earned, lessonsDone, forumPosts, certs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { streak: true } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badge: { select: { slug: true } } } }),
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
    prisma.forumPost.count({ where: { authorId: userId, deletedAt: null } }),
    prisma.certificate.findMany({ where: { userId }, select: { parcours: { select: { disciplineId: true } } } }),
  ]);
  if (!user) return [];

  const earnedSlugs = new Set(earned.map((e) => e.badge.slug));
  const disciplines = new Set(certs.map((c) => c.parcours.disciplineId));

  // Règles déclaratives : slug → critère rempli ?
  const rules: Record<string, boolean> = {
    "premier-pas": lessonsDone >= 1,
    "streak-7": user.streak >= 6,
    "quiz-parfait": ctx.quizPerfect === true,
    entraide: forumPosts >= 10,
    diplome: certs.length >= 1,
    polyglotte: disciplines.size >= 2,
  };

  const toAward = Object.entries(rules)
    .filter(([slug, ok]) => ok && !earnedSlugs.has(slug))
    .map(([slug]) => slug);
  if (toAward.length === 0) return [];

  const badges = await prisma.badge.findMany({ where: { slug: { in: toAward } }, select: { id: true, slug: true } });
  for (const b of badges) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: b.id } },
      update: {},
      create: { userId, badgeId: b.id },
    });
  }
  return badges.map((b) => b.slug);
}
