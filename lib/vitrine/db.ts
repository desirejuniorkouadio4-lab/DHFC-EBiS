import "server-only";
import { prisma } from "@/lib/prisma";

/** Couche données du back-office « contenu vitrine » (admin) — toutes les entrées. */

export type AdminPartenaire = { id: string; acronym: string; name: string; role: string; logoUrl: string | null; order: number; published: boolean };
export type AdminActualite = { id: string; slug: string; title: string; excerpt: string; category: string; publishedAt: string; readingTime: number; published: boolean };
export type AdminTemoignage = { id: string; name: string; role: string; college: string; quote: string; initials: string; order: number; published: boolean };
export type AdminRessource = { id: string; title: string; type: string; category: string; size: string | null; url: string | null; order: number; published: boolean };

export async function listPartenairesAdmin(): Promise<AdminPartenaire[]> {
  const rows = await prisma.partenaire.findMany({ orderBy: { order: "asc" } });
  return rows.map((p) => ({ id: p.id, acronym: p.acronym, name: p.name, role: p.role, logoUrl: p.logoUrl, order: p.order, published: p.published }));
}

export async function listActualitesAdmin(): Promise<AdminActualite[]> {
  const rows = await prisma.actualite.findMany({ orderBy: { publishedAt: "desc" } });
  return rows.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    publishedAt: a.publishedAt.toISOString().slice(0, 10),
    readingTime: a.readingTime,
    published: a.published,
  }));
}

export async function listTemoignagesAdmin(): Promise<AdminTemoignage[]> {
  const rows = await prisma.temoignage.findMany({ orderBy: { order: "asc" } });
  return rows.map((t) => ({ id: t.id, name: t.name, role: t.role, college: t.college, quote: t.quote, initials: t.initials, order: t.order, published: t.published }));
}

export async function listRessourcesAdmin(): Promise<AdminRessource[]> {
  const rows = await prisma.ressource.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({ id: r.id, title: r.title, type: r.type, category: r.category, size: r.size, url: r.url, order: r.order, published: r.published }));
}
