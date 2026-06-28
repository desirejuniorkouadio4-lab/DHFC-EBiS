/**
 * RBAC — rôles, libellés, espace d'accueil et permissions (cahier §10.4).
 * Module pur (sans dépendance serveur) : utilisable côté client et serveur.
 */

export type Role =
  | "APPRENANT"
  | "TUTEUR"
  | "ENCADREUR"
  | "CONCEPTEUR"
  | "ADMIN"
  | "SUPERADMIN";

export const ROLE_LABEL: Record<string, string> = {
  APPRENANT: "Apprenant",
  TUTEUR: "Tuteur",
  ENCADREUR: "Encadreur",
  CONCEPTEUR: "Concepteur",
  ADMIN: "Administrateur",
  SUPERADMIN: "Super administrateur",
};

/** Espace d'accueil par rôle (cible de redirection après connexion). */
export const ROLE_HOME: Record<string, string> = {
  APPRENANT: "/tableau-de-bord",
  TUTEUR: "/tuteur",
  ENCADREUR: "/encadreur",
  CONCEPTEUR: "/concepteur",
  ADMIN: "/admin",
  SUPERADMIN: "/admin",
};

export function roleLabel(role?: string | null): string {
  return (role && ROLE_LABEL[role]) || "Utilisateur";
}

export function roleHomePath(role?: string | null): string {
  return (role && ROLE_HOME[role]) || "/tableau-de-bord";
}

/**
 * Permissions déclaratives (v1 minimale, étendue au fil des chantiers).
 * `can(role, action)` répond par oui/non.
 */
const PERMISSIONS: Record<string, readonly string[]> = {
  SUPERADMIN: ["*"],
  ADMIN: ["admin.access", "users.manage", "cohorts.manage", "media.manage", "courses.manage"],
  CONCEPTEUR: ["courses.manage", "exercices.manage"],
  ENCADREUR: ["cohorts.view", "reports.view"],
  TUTEUR: ["cohort.view", "submissions.grade", "messages.send"],
  APPRENANT: ["courses.learn", "submissions.create"],
};

export function can(role: string | null | undefined, action: string): boolean {
  if (!role) return false;
  const perms = PERMISSIONS[role] ?? [];
  return perms.includes("*") || perms.includes(action);
}
