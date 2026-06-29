"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import type { Role } from "@prisma/client";
import { deletePublicFile } from "@/lib/storage/blob";
import { parseCsv } from "@/lib/admin/csv";
import bcrypt from "bcryptjs";

const IMPORT_ROLES: Role[] = ["APPRENANT", "TUTEUR", "ENCADREUR", "CONCEPTEUR"];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

/**
 * Importe des utilisateurs depuis un CSV (en-tête requis : firstName, lastName,
 * email ; optionnels : role, bivalence, region, dren, college). Mot de passe
 * temporaire commun ("Bienvenue2026!"). Ignore les doublons et les lignes invalides.
 */
export async function importUsers(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const text = String(formData.get("csv") ?? "");
  const rows = parseCsv(text);
  if (rows.length < 2) redirect("/admin/utilisateurs?import=vide");

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const iFirst = col("firstname");
  const iLast = col("lastname");
  const iEmail = col("email");
  const iRole = col("role");
  const iBiv = col("bivalence");
  const iRegion = col("region");
  const iDren = col("dren");
  const iCollege = col("college");
  if (iFirst < 0 || iLast < 0 || iEmail < 0) redirect("/admin/utilisateurs?import=entete");

  const tempHash = await bcrypt.hash("Bienvenue2026!", 10);
  const cell = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  let created = 0;
  let skipped = 0;

  for (const r of rows.slice(1)) {
    const email = cell(r, iEmail).toLowerCase();
    const firstName = cell(r, iFirst);
    const lastName = cell(r, iLast);
    if (!firstName || !lastName || !EMAIL_RE.test(email)) {
      skipped++;
      continue;
    }
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) {
      skipped++;
      continue;
    }
    const rawRole = cell(r, iRole).toUpperCase() as Role;
    const role: Role = IMPORT_ROLES.includes(rawRole) ? rawRole : "APPRENANT";
    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role,
        passwordHash: tempHash,
        bivalence: cell(r, iBiv) || null,
        region: cell(r, iRegion) || null,
        dren: cell(r, iDren) || null,
        college: cell(r, iCollege) || null,
      },
    });
    created++;
  }

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
  redirect(`/admin/utilisateurs?created=${created}&skipped=${skipped}`);
}

/** Met à jour les paramètres système (§17.6). */
export async function updateSiteSettings(formData: FormData): Promise<void> {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const entries: [string, string][] = [
    ["announcementEnabled", formData.get("announcementEnabled") === "on" ? "true" : "false"],
    ["announcementText", String(formData.get("announcementText") ?? "").slice(0, 300)],
    ["maintenanceEnabled", formData.get("maintenanceEnabled") === "on" ? "true" : "false"],
    ["maintenanceText", String(formData.get("maintenanceText") ?? "").slice(0, 300)],
  ];
  await prisma.$transaction(
    entries.map(([key, value]) => prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }))
  );
  revalidateTag("site-settings");
  revalidatePath("/admin/parametres");
}

/** Enregistre un média (fichier déjà téléversé côté client) dans la médiathèque (§17.5). */
export async function addMedia(data: { url: string; filename: string; contentType: string; size: number }): Promise<void> {
  const actor = await requireRole(["ADMIN", "SUPERADMIN"]);
  if (!data?.url || !/^(https?:\/\/|\/uploads\/)/.test(data.url)) return;
  await prisma.media.create({
    data: {
      url: data.url,
      filename: (data.filename || "fichier").slice(0, 200),
      contentType: data.contentType || "application/octet-stream",
      size: data.size || 0,
      uploadedById: actor.id,
    },
  });
  revalidatePath("/admin/media");
}

/** Supprime un média (fichier + entrée). */
export async function deleteMedia(id: string): Promise<void> {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const media = await prisma.media.findUnique({ where: { id }, select: { url: true } });
  if (!media) return;
  await deletePublicFile(media.url);
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
}
