import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleHomePath } from "@/lib/rbac";
import { getImpersonatedId } from "@/lib/impersonation";

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
  /** Vrai si un admin agit actuellement « en tant que » cet utilisateur. */
  impersonating?: boolean;
  /** Nom de l'admin qui impersonne (pour la bannière). */
  impersonatorName?: string;
  impersonatorRole?: string;
};

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

/**
 * Retourne l'utilisateur connecté (données complètes depuis la base), ou null.
 * Si le compte réel est admin et qu'une impersonation est active, renvoie
 * l'utilisateur cible enrichi des infos de bannière (réversible).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const realId = session.user.id;
  const realRole = session.user.role;

  // Résolution de l'utilisateur effectif (impersonation admin).
  let effectiveId = realId;
  let impersonating = false;
  if (realRole && ADMIN_ROLES.includes(realRole)) {
    const targetId = await getImpersonatedId();
    if (targetId && targetId !== realId) {
      effectiveId = targetId;
      impersonating = true;
    }
  }

  let u = await prisma.user.findUnique({ where: { id: effectiveId } });
  // Cible disparue → retombe sur le compte réel.
  if (!u && impersonating) {
    impersonating = false;
    u = await prisma.user.findUnique({ where: { id: realId } });
  }
  if (!u) return null;

  let impersonatorName: string | undefined;
  let impersonatorRole: string | undefined;
  if (impersonating) {
    const admin = await prisma.user.findUnique({
      where: { id: realId },
      select: { firstName: true, lastName: true, role: true },
    });
    if (admin) {
      impersonatorName = `${admin.firstName} ${admin.lastName}`;
      impersonatorRole = admin.role;
    }
  }

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
    impersonating,
    impersonatorName,
    impersonatorRole,
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
