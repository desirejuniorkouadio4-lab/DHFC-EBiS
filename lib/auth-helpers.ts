import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleHomePath } from "@/lib/rbac";

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

/** Profil considéré complet quand les champs d'onboarding sont renseignés. */
export function isProfileComplete(user: SessionUser): boolean {
  return Boolean(user.bivalence && user.region && user.dren && user.college);
}

/** Exige une session ; redirige vers /connexion sinon. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");
  return user;
}

/**
 * Exige une session ET un rôle autorisé.
 * Redirige vers /connexion (non connecté) ou vers l'espace du rôle (non autorisé).
 */
export async function requireRole(allowed: string[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");
  if (!allowed.includes(user.role)) redirect(roleHomePath(user.role));
  return user;
}
