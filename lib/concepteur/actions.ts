"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import type { Level, LessonType } from "@prisma/client";
import type { QuizContent } from "@/lib/exercices/types";

/** Garde commune : seuls concepteur/admin accèdent à ces mutations. */
async function guard() {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

/** Génère un slug unique à partir d'un titre (suffixe -2, -3… si collision). */
async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "parcours";
  let slug = base;
  let n = 2;
  while (await prisma.parcours.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

/** Découpe un textarea (une entrée par ligne) en tableau nettoyé. */
function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

const VALID_LEVELS: Level[] = ["DEBUTANT", "INTERMEDIAIRE", "AVANCE"];
const VALID_TYPES: LessonType[] = ["VIDEO", "TEXTE", "QUIZ"];

function defaultContent(type: LessonType) {
  if (type === "VIDEO") return { kind: "video", intro: "", chapters: [], transcript: "" };
  if (type === "QUIZ") return { kind: "quiz", intro: "", passScore: 60, exercices: [] };
  return { kind: "texte", sections: [{ heading: "Introduction", body: [""] }] };
}

/* ============================================================
 *  Parcours
 * ============================================================ */

export async function createParcours(formData: FormData): Promise<void> {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  const disciplineId = String(formData.get("disciplineId") ?? "");
  const level = String(formData.get("level") ?? "DEBUTANT") as Level;
  if (!title || !disciplineId || !VALID_LEVELS.includes(level)) return;

  const slug = await uniqueSlug(title);
  await prisma.parcours.create({
    data: {
      slug,
      title,
      subtitle: "",
      description: "",
      disciplineId,
      level,
      durationHours: 0,
      published: false,
      objectives: [],
      prerequisites: [],
      tags: [],
    },
  });
  revalidatePath("/concepteur");
  redirect(`/concepteur/${slug}`);
}

export async function updateParcoursMeta(parcoursId: string, formData: FormData): Promise<void> {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  const level = String(formData.get("level") ?? "DEBUTANT") as Level;
  if (!title || !VALID_LEVELS.includes(level)) return;

  const updated = await prisma.parcours.update({
    where: { id: parcoursId },
    data: {
      title,
      subtitle: String(formData.get("subtitle") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      disciplineId: String(formData.get("disciplineId") ?? ""),
      level,
      durationHours: Math.max(0, Number(formData.get("durationHours") ?? 0) || 0),
      objectives: lines(formData.get("objectives")),
      prerequisites: lines(formData.get("prerequisites")),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    },
    select: { slug: true },
  });
  revalidatePath(`/concepteur/${updated.slug}`);
  revalidatePath("/concepteur");
}

export async function togglePublish(parcoursId: string): Promise<void> {
  await guard();
  const p = await prisma.parcours.findUnique({
    where: { id: parcoursId },
    select: { slug: true, published: true },
  });
  if (!p) return;
  await prisma.parcours.update({
    where: { id: parcoursId },
    data: { published: !p.published },
  });
  revalidatePath(`/concepteur/${p.slug}`);
  revalidatePath("/concepteur");
  revalidatePath("/parcours");
}

export async function deleteParcours(parcoursId: string): Promise<void> {
  await guard();
  const enrolled = await prisma.enrollment.count({ where: { parcoursId } });
  // Sécurité : on ne supprime pas un parcours auquel des apprenants sont inscrits.
  if (enrolled > 0) {
    revalidatePath("/concepteur");
    return;
  }
  await prisma.parcours.delete({ where: { id: parcoursId } });
  revalidatePath("/concepteur");
  redirect("/concepteur");
}

/* ============================================================
 *  Modules
 * ============================================================ */

async function parcoursSlugOfModule(moduleId: string): Promise<string | null> {
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { parcours: { select: { slug: true } } },
  });
  return m?.parcours.slug ?? null;
}

export async function addModule(parcoursId: string, formData: FormData): Promise<void> {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const last = await prisma.module.findFirst({
    where: { parcoursId },
    orderBy: { index: "desc" },
    select: { index: true },
  });
  await prisma.module.create({
    data: { parcoursId, title, index: (last?.index ?? -1) + 1 },
  });
  const slug = (await prisma.parcours.findUnique({ where: { id: parcoursId }, select: { slug: true } }))?.slug;
  if (slug) revalidatePath(`/concepteur/${slug}`);
}

export async function renameModule(moduleId: string, formData: FormData): Promise<void> {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await prisma.module.update({ where: { id: moduleId }, data: { title } });
  const slug = await parcoursSlugOfModule(moduleId);
  if (slug) revalidatePath(`/concepteur/${slug}`);
}

export async function deleteModule(moduleId: string): Promise<void> {
  await guard();
  const slug = await parcoursSlugOfModule(moduleId);
  await prisma.module.delete({ where: { id: moduleId } });
  if (slug) revalidatePath(`/concepteur/${slug}`);
}

export async function moveModule(moduleId: string, dir: "up" | "down"): Promise<void> {
  await guard();
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, index: true, parcoursId: true },
  });
  if (!m) return;
  const neighbor = await prisma.module.findFirst({
    where: {
      parcoursId: m.parcoursId,
      index: dir === "up" ? { lt: m.index } : { gt: m.index },
    },
    orderBy: { index: dir === "up" ? "desc" : "asc" },
    select: { id: true, index: true },
  });
  if (!neighbor) return;
  // Permutation via index sentinelle (-1) pour respecter l'unicité (parcoursId, index).
  await prisma.$transaction([
    prisma.module.update({ where: { id: m.id }, data: { index: -1 } }),
    prisma.module.update({ where: { id: neighbor.id }, data: { index: m.index } }),
    prisma.module.update({ where: { id: m.id }, data: { index: neighbor.index } }),
  ]);
  const slug = (await prisma.parcours.findUnique({ where: { id: m.parcoursId }, select: { slug: true } }))?.slug;
  if (slug) revalidatePath(`/concepteur/${slug}`);
}

/* ============================================================
 *  Leçons
 * ============================================================ */

async function parcoursSlugOfLesson(lessonId: string): Promise<string | null> {
  const l = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { parcours: { select: { slug: true } } } } },
  });
  return l?.module.parcours.slug ?? null;
}

export async function addLesson(moduleId: string, formData: FormData): Promise<void> {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "TEXTE") as LessonType;
  const durationMin = Math.max(1, Number(formData.get("durationMin") ?? 10) || 10);
  if (!title || !VALID_TYPES.includes(type)) return;

  const last = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { index: "desc" },
    select: { index: true },
  });
  await prisma.lesson.create({
    data: {
      moduleId,
      title,
      type,
      durationMin,
      index: (last?.index ?? -1) + 1,
      content: defaultContent(type),
    },
  });
  const slug = await parcoursSlugOfModule(moduleId);
  if (slug) revalidatePath(`/concepteur/${slug}`);
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await guard();
  const slug = await parcoursSlugOfLesson(lessonId);
  await prisma.lesson.delete({ where: { id: lessonId } });
  if (slug) revalidatePath(`/concepteur/${slug}`);
}

export async function moveLesson(lessonId: string, dir: "up" | "down"): Promise<void> {
  await guard();
  const l = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, index: true, moduleId: true },
  });
  if (!l) return;
  const neighbor = await prisma.lesson.findFirst({
    where: {
      moduleId: l.moduleId,
      index: dir === "up" ? { lt: l.index } : { gt: l.index },
    },
    orderBy: { index: dir === "up" ? "desc" : "asc" },
    select: { id: true, index: true },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: l.id }, data: { index: -1 } }),
    prisma.lesson.update({ where: { id: neighbor.id }, data: { index: l.index } }),
    prisma.lesson.update({ where: { id: l.id }, data: { index: neighbor.index } }),
  ]);
  const slug = await parcoursSlugOfModule(l.moduleId);
  if (slug) revalidatePath(`/concepteur/${slug}`);
}

/** Type du contenu sauvegardé depuis l'éditeur de leçon. */
export type LessonContentInput =
  | { kind: "video"; intro: string; chapters: { time: string; label: string }[]; transcript: string }
  | { kind: "texte"; sections: { heading: string; body: string[] }[] }
  | QuizContent;

export async function updateLesson(
  lessonId: string,
  data: { title: string; type: LessonType; durationMin: number; content: LessonContentInput }
): Promise<void> {
  await guard();
  const title = data.title.trim();
  if (!title || !VALID_TYPES.includes(data.type)) return;
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      type: data.type,
      durationMin: Math.max(1, data.durationMin || 1),
      content: data.content as object,
    },
  });
  const slug = await parcoursSlugOfLesson(lessonId);
  if (slug) {
    revalidatePath(`/concepteur/${slug}`);
    redirect(`/concepteur/${slug}`);
  }
}
