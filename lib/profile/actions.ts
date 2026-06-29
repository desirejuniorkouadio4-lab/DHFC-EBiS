"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

/** Met à jour les informations personnelles du compte connecté. */
export async function updateProfile(formData: FormData): Promise<void> {
  const user = await requireUser();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName,
      lastName,
      phone: String(formData.get("phone") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim().slice(0, 600) || null,
      bivalence: String(formData.get("bivalence") ?? "").trim() || null,
      region: String(formData.get("region") ?? "").trim() || null,
      dren: String(formData.get("dren") ?? "").trim() || null,
      college: String(formData.get("college") ?? "").trim() || null,
    },
  });
  revalidatePath("/profil");
}

// Réglages modifiables par l'utilisateur (classement / activité / digest sont
// imposés par le dispositif et volontairement absents de cette liste).
/** Enregistre la photo de profil (fichier déjà téléversé côté client). */
export async function setAvatar(data: { url: string }): Promise<void> {
  const user = await requireUser();
  if (!data?.url || !/^(https?:\/\/|\/uploads\/)/.test(data.url)) return;
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: data.url } });
  revalidatePath("/profil");
}

/** Retire la photo de profil. */
export async function removeAvatar(): Promise<void> {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: null } });
  revalidatePath("/profil");
}

const BOOL_KEYS = ["allowMessages", "emailNotif", "marketingConsent"] as const;
const VISIBILITY = ["PUBLIC", "COHORT", "PRIVATE"];

/** Met à jour les préférences de confidentialité / notifications (RGPD §25.3). */
export async function updateUserPrefs(prefs: Record<string, boolean | string>): Promise<void> {
  const user = await requireUser();
  const data: Record<string, boolean | string> = {};
  for (const [k, v] of Object.entries(prefs)) {
    if ((BOOL_KEYS as readonly string[]).includes(k) && typeof v === "boolean") data[k] = v;
    else if (k === "profileVisibility" && typeof v === "string" && VISIBILITY.includes(v)) data[k] = v;
  }
  if (Object.keys(data).length) {
    await prisma.user.update({ where: { id: user.id }, data });
    revalidatePath("/profil");
  }
}

/** Change le mot de passe (vérifie l'actuel). */
export async function changePassword(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { ok: false, error: "Le nouveau mot de passe doit faire au moins 8 caractères." };

  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!u?.passwordHash || !(await bcrypt.compare(current, u.passwordHash))) {
    return { ok: false, error: "Mot de passe actuel incorrect." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return { ok: true };
}

/**
 * Supprime définitivement le compte connecté et toutes ses données liées
 * (droit à l'effacement RGPD). Déconnecte puis redirige.
 */
export async function deleteMyAccount(formData: FormData): Promise<void> {
  const user = await requireUser();
  // Garde-fou : confirmation explicite par saisie de « SUPPRIMER ».
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "SUPPRIMER") {
    redirect("/profil?delete=confirme");
  }
  await prisma.user.delete({ where: { id: user.id } });
  // Invalide la session (le cookie pointera vers un utilisateur inexistant).
  const c = await cookies();
  for (const name of ["authjs.session-token", "__Secure-authjs.session-token", "next-auth.session-token"]) {
    c.delete(name);
  }
  redirect("/connexion?compte=supprime");
}
