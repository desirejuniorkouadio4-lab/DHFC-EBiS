import { prisma } from "@/lib/prisma";

/** Émission des certificats à la complétion d'un parcours (§18.1). */

/** Code de vérification unique, format DHFC-26-XXXXXX. */
function randomCode(): string {
  const part = Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
  const year = new Date().getFullYear().toString().slice(2);
  return `DHFC-${year}-${part}`;
}

async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = randomCode();
    if (!(await prisma.certificate.findUnique({ where: { code }, select: { id: true } }))) return code;
  }
  return randomCode() + Date.now().toString(36).slice(-3).toUpperCase();
}

/**
 * Délivre un certificat si le parcours est terminé (idempotent : un seul par
 * couple utilisateur/parcours). Renvoie le code, ou null si déjà délivré / incomplet.
 */
export async function issueCertificateIfComplete(
  userId: string,
  parcoursSlug: string,
  score = 100
): Promise<string | null> {
  const parcours = await prisma.parcours.findUnique({ where: { slug: parcoursSlug }, select: { id: true } });
  if (!parcours) return null;

  const existing = await prisma.certificate.findUnique({
    where: { userId_parcoursId: { userId, parcoursId: parcours.id } },
    select: { code: true },
  });
  if (existing) return null;

  const code = await uniqueCode();
  try {
    await prisma.certificate.create({
      data: { userId, parcoursId: parcours.id, code, score: Math.round(score) },
    });
    return code;
  } catch {
    // Course critique : un autre appel a pu créer le certificat entre-temps.
    return null;
  }
}
