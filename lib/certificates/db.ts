import { prisma } from "@/lib/prisma";

/** Accès aux certificats (vérification publique + tableau de bord apprenant). */

export type CertificateView = {
  code: string;
  name: string;
  parcoursTitle: string;
  parcoursSlug: string;
  issuedAt: Date;
  score: number;
};

/** Certificat par code (vérification publique, sans authentification). */
export async function getCertificateByCode(code: string): Promise<CertificateView | null> {
  const c = await prisma.certificate.findUnique({
    where: { code },
    select: {
      code: true,
      score: true,
      issuedAt: true,
      user: { select: { firstName: true, lastName: true } },
      parcours: { select: { title: true, slug: true } },
    },
  });
  if (!c) return null;
  return {
    code: c.code,
    name: `${c.user.firstName} ${c.user.lastName}`,
    parcoursTitle: c.parcours.title,
    parcoursSlug: c.parcours.slug,
    issuedAt: c.issuedAt,
    score: c.score,
  };
}

/** Certificats obtenus par un apprenant. */
export async function getUserCertificates(userId: string): Promise<CertificateView[]> {
  const rows = await prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    select: {
      code: true,
      score: true,
      issuedAt: true,
      user: { select: { firstName: true, lastName: true } },
      parcours: { select: { title: true, slug: true } },
    },
  });
  return rows.map((c) => ({
    code: c.code,
    name: `${c.user.firstName} ${c.user.lastName}`,
    parcoursTitle: c.parcours.title,
    parcoursSlug: c.parcours.slug,
    issuedAt: c.issuedAt,
    score: c.score,
  }));
}
