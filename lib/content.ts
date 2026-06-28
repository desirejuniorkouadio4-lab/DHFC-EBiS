import { prisma } from "@/lib/prisma";
import type { Parcours, Actualite, Partenaire, Temoignage } from "@/lib/data";
import type { ProgrammeModule } from "@/components/marketing/programme-accordion";

/**
 * Couche d'accès aux données (Server Components → Prisma → Neon).
 * Les fonctions renvoient des formes compatibles avec les types existants
 * (`lib/data.ts`) afin de minimiser les changements côté composants.
 * Les métadonnées visuelles des disciplines (icône, couleur) restent
 * des constantes UI résolues par slug.
 */

const LEVEL_FR: Record<string, Parcours["level"]> = {
  DEBUTANT: "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  AVANCE: "Avancé",
};

const LESSON_TYPE_FR: Record<string, ProgrammeModule["lessons"][number]["type"]> = {
  VIDEO: "video",
  TEXTE: "texte",
  QUIZ: "quiz",
};

type ParcoursRow = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  durationHours: number;
  ratingAvg: number;
  reviewsCount: number;
  enrolledCount: number;
  isNew: boolean;
  objectives: string[];
  prerequisites: string[];
  tags: string[];
  discipline: { slug: string };
  _count: { modules: number };
};

function toParcours(p: ParcoursRow, lessonsCount: number): Parcours {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    description: p.description,
    disciplineSlug: p.discipline.slug,
    level: LEVEL_FR[p.level] ?? "Débutant",
    durationHours: p.durationHours,
    modules: p._count.modules,
    lessons: lessonsCount,
    rating: p.ratingAvg,
    reviews: p.reviewsCount,
    enrolled: p.enrolledCount,
    isNew: p.isNew,
    objectives: p.objectives,
    prerequisites: p.prerequisites,
    tags: p.tags,
  };
}

const parcoursSelect = {
  slug: true,
  title: true,
  subtitle: true,
  description: true,
  level: true,
  durationHours: true,
  ratingAvg: true,
  reviewsCount: true,
  enrolledCount: true,
  isNew: true,
  objectives: true,
  prerequisites: true,
  tags: true,
  discipline: { select: { slug: true } },
  _count: { select: { modules: true } },
} as const;

export async function getAllParcours(): Promise<Parcours[]> {
  const rows = await prisma.parcours.findMany({
    where: { published: true },
    // Compte des leçons agrégé en une seule requête (évite un N+1 qui saturait le pool).
    select: { ...parcoursSelect, modules: { select: { _count: { select: { lessons: true } } } } },
    orderBy: [{ isNew: "desc" }, { enrolledCount: "desc" }],
  });
  return rows.map((r) => toParcours(r, r.modules.reduce((acc, m) => acc + m._count.lessons, 0)));
}

export async function getFeaturedParcours(limit = 3): Promise<Parcours[]> {
  const all = await getAllParcours();
  return all.slice(0, limit);
}

export type ParcoursDetail = Parcours & { programme: ProgrammeModule[] };

export async function getParcoursBySlug(slug: string): Promise<ParcoursDetail | null> {
  const p = await prisma.parcours.findFirst({
    where: { slug, published: true },
    select: {
      ...parcoursSelect,
      modules: {
        orderBy: { index: "asc" },
        select: {
          title: true,
          lessons: {
            orderBy: { index: "asc" },
            select: { title: true, type: true, durationMin: true },
          },
        },
      },
    },
  });
  if (!p) return null;

  const lessonsCount = p.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const base = toParcours(p as unknown as ParcoursRow, lessonsCount);
  const programme: ProgrammeModule[] = p.modules.map((m) => ({
    title: m.title,
    lessons: m.lessons.map((l) => ({
      title: l.title,
      type: LESSON_TYPE_FR[l.type] ?? "texte",
      duration: `${l.durationMin} min`,
    })),
  }));

  return { ...base, programme };
}

export async function getSimilarParcours(slug: string, disciplineSlug: string, limit = 3): Promise<Parcours[]> {
  const all = await getAllParcours();
  const same = all.filter((p) => p.slug !== slug && p.disciplineSlug === disciplineSlug);
  const pool = same.length ? same : all.filter((p) => p.slug !== slug);
  return pool.slice(0, limit);
}

export async function getActualites(): Promise<Actualite[]> {
  const rows = await prisma.actualite.findMany({ orderBy: { publishedAt: "desc" } });
  return rows.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    date: a.publishedAt.toISOString(),
    readingTime: a.readingTime,
  }));
}

export async function getPartenaires(): Promise<Partenaire[]> {
  const rows = await prisma.partenaire.findMany({ orderBy: { order: "asc" } });
  return rows.map((p) => ({ acronym: p.acronym, name: p.name, role: p.role }));
}

export async function getTemoignages(): Promise<Temoignage[]> {
  const rows = await prisma.temoignage.findMany({ orderBy: { order: "asc" } });
  return rows.map((t) => ({
    name: t.name,
    role: t.role,
    college: t.college,
    quote: t.quote,
    initials: t.initials,
  }));
}
