import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: string;
  bivalence: string | null;
  region: string | null;
  dren: string | null;
  college: string | null;
  xp: number;
  level: number;
  nextLevelXp: number;
  streak: number;
};

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

/** Retourne l'utilisateur connecté (données complètes depuis la base), ou null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const u = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!u) return null;

  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    initials: initials(u.firstName, u.lastName),
    role: u.role,
    bivalence: u.bivalence,
    region: u.region,
    dren: u.dren,
    college: u.college,
    xp: u.xp,
    level: u.level,
    nextLevelXp: 1500,
    streak: u.streak,
  };
}
