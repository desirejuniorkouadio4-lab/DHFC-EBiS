import { prisma } from "@/lib/prisma";

/** Points d'expérience et niveaux (§18.3). 300 XP par niveau. */

export const XP_PER_LEVEL = 300;

export const XP = {
  lesson: 10, // leçon terminée
  quizPass: 20, // quiz réussi
  quizPerfect: 30, // quiz 100 %
  certificate: 100, // certificat obtenu
  forumPost: 5, // réponse au forum
} as const;

export function levelFromXp(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / XP_PER_LEVEL);
}

export function nextLevelXp(level: number): number {
  return level * XP_PER_LEVEL;
}

/** Ajoute de l'XP à un utilisateur et recalcule son niveau. */
export async function awardXp(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
  if (!u) return;
  const xp = u.xp + amount;
  await prisma.user.update({ where: { id: userId }, data: { xp, level: levelFromXp(xp) } });
}
