"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import type { Role } from "@prisma/client";

const ROLES: Role[] = ["APPRENANT", "TUTEUR", "ENCADREUR", "CONCEPTEUR", "ADMIN", "SUPERADMIN"];

/** Modifie le rôle d'un utilisateur. */
export async function setUserRole(userId: string, formData: FormData): Promise<void> {
  const actor = await requireRole(["ADMIN", "SUPERADMIN"]);
  const role = String(formData.get("role") ?? "") as Role;
  if (!ROLES.includes(role)) return;
  // Sécurité : on ne modifie pas son propre rôle ; seul un SUPERADMIN peut créer un SUPERADMIN.
  if (userId === actor.id) return;
  if (role === "SUPERADMIN" && actor.role !== "SUPERADMIN") return;

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
}

/** Active / désactive un compte (un compte désactivé ne peut plus se connecter). */
export async function toggleUserActive(userId: string): Promise<void> {
  const actor = await requireRole(["ADMIN", "SUPERADMIN"]);
  if (userId === actor.id) return; // pas de désactivation de soi-même

  const u = await prisma.user.findUnique({ where: { id: userId }, select: { active: true } });
  if (!u) return;
  await prisma.user.update({ where: { id: userId }, data: { active: !u.active } });
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
}

/** Crée une cohorte (nom + tuteur optionnel). */
export async function createCohort(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const tutorId = String(formData.get("tutorId") ?? "") || null;
  await prisma.cohort.create({ data: { name, tutorId } });
  revalidatePath("/admin/cohortes");
  revalidatePath("/admin");
  redirect("/admin/cohortes");
}

/** (Ré)affecte le tuteur d'une cohorte. */
export async function assignCohortTutor(cohortId: string, formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const tutorId = String(formData.get("tutorId") ?? "") || null;
  await prisma.cohort.update({ where: { id: cohortId }, data: { tutorId } });
  revalidatePath("/admin/cohortes");
}
