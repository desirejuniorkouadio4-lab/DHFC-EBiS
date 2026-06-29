import { prisma } from "@/lib/prisma";
import type { Level, LessonType } from "@prisma/client";

/**
 * Couche d'accès du back-office concepteur (Server Components → Prisma → Neon).
 * Contrairement à `lib/content.ts` (vitrine, parcours publiés uniquement),
 * ces requêtes voient TOUS les parcours, brouillons compris.
 */

export type ParcoursListItem = {
  id: string;
  slug: string;
  title: string;
  disciplineName: string;
  disciplineShort: string;
  disciplineColor: string;
  level: Level;
  published: boolean;
  modulesCount: number;
  lessonsCount: number;
  enrolledCount: number;
  updatedAt: Date;
};

/** Tous les parcours pour le tableau de bord concepteur (brouillons inclus). */
export async function listParcoursForConcepteur(): Promise<ParcoursListItem[]> {
  const rows = await prisma.parcours.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      level: true,
      published: true,
      enrolledCount: true,
      updatedAt: true,
      discipline: { select: { name: true, short: true, color: true } },
      modules: { select: { _count: { select: { lessons: true } } } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    disciplineName: p.discipline.name,
    disciplineShort: p.discipline.short,
    disciplineColor: p.discipline.color,
    level: p.level,
    published: p.published,
    modulesCount: p.modules.length,
    lessonsCount: p.modules.reduce((acc, m) => acc + m._count.lessons, 0),
    enrolledCount: p.enrolledCount,
    updatedAt: p.updatedAt,
  }));
}

export type EditModuleLesson = {
  id: string;
  index: number;
  title: string;
  type: LessonType;
  durationMin: number;
};
export type EditModule = {
  id: string;
  index: number;
  title: string;
  lessons: EditModuleLesson[];
};
export type ParcoursForEdit = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  disciplineId: string;
  level: Level;
  durationHours: number;
  published: boolean;
  coverUrl: string | null;
  enrolledCount: number;
  objectives: string[];
  prerequisites: string[];
  tags: string[];
  modules: EditModule[];
};

/** Détail complet d'un parcours pour l'éditeur (métadonnées + structure). */
export async function getParcoursForEdit(slug: string): Promise<ParcoursForEdit | null> {
  const p = await prisma.parcours.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      disciplineId: true,
      level: true,
      durationHours: true,
      published: true,
      coverUrl: true,
      enrolledCount: true,
      objectives: true,
      prerequisites: true,
      tags: true,
      modules: {
        orderBy: { index: "asc" },
        select: {
          id: true,
          index: true,
          title: true,
          lessons: {
            orderBy: { index: "asc" },
            select: { id: true, index: true, title: true, type: true, durationMin: true },
          },
        },
      },
    },
  });
  return p;
}

export type LessonForEdit = {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  content: unknown;
  moduleTitle: string;
  parcoursSlug: string;
  parcoursTitle: string;
};

/** Une leçon avec son contenu, pour l'éditeur de leçon. */
export async function getLessonForEdit(lessonId: string): Promise<LessonForEdit | null> {
  const l = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      type: true,
      durationMin: true,
      content: true,
      module: {
        select: { title: true, parcours: { select: { slug: true, title: true } } },
      },
    },
  });
  if (!l) return null;
  return {
    id: l.id,
    title: l.title,
    type: l.type,
    durationMin: l.durationMin,
    content: l.content,
    moduleTitle: l.module.title,
    parcoursSlug: l.module.parcours.slug,
    parcoursTitle: l.module.parcours.title,
  };
}

export type DisciplineOption = { id: string; name: string; short: string };

/** Disciplines pour les sélecteurs. */
export async function listDisciplines(): Promise<DisciplineOption[]> {
  return prisma.discipline.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, short: true },
  });
}
