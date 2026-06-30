"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

const guard = () => requireRole(["ADMIN", "SUPERADMIN"]);
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const n = (fd: FormData, k: string, d = 0) => {
  const v = Number(fd.get(k));
  return Number.isFinite(v) ? v : d;
};

function slugify(input: string): string {
  return input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 70);
}
function initialsOf(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

function revalidateVitrine(path: string) {
  revalidatePath("/admin/vitrine");
  revalidatePath(path);
  revalidatePath("/");
}

/** Enregistre l'URL d'un logo téléversé (Blob ou disque dev). */
export async function setPartenaireLogo(id: string, data: { url: string }): Promise<void> {
  await guard();
  if (!data?.url || !/^(https?:\/\/|\/uploads\/)/.test(data.url)) return;
  await prisma.partenaire.update({ where: { id }, data: { logoUrl: data.url } });
  revalidateVitrine("/partenaires");
}

/* ---------------- Partenaires ---------------- */
export async function createPartenaire(formData: FormData): Promise<void> {
  await guard();
  const acronym = s(formData, "acronym");
  const name = s(formData, "name");
  if (!acronym || !name) return;
  const exists = await prisma.partenaire.findUnique({ where: { acronym }, select: { id: true } });
  if (exists) return;
  await prisma.partenaire.create({
    data: { acronym, name, role: s(formData, "role"), logoUrl: s(formData, "logoUrl") || null, order: n(formData, "order") },
  });
  revalidateVitrine("/partenaires");
}
export async function updatePartenaire(id: string, formData: FormData): Promise<void> {
  await guard();
  await prisma.partenaire.update({
    where: { id },
    data: { acronym: s(formData, "acronym"), name: s(formData, "name"), role: s(formData, "role"), logoUrl: s(formData, "logoUrl") || null, order: n(formData, "order") },
  });
  revalidateVitrine("/partenaires");
}
export async function deletePartenaire(id: string): Promise<void> {
  await guard();
  await prisma.partenaire.delete({ where: { id } });
  revalidateVitrine("/partenaires");
}
export async function togglePartenaire(id: string): Promise<void> {
  await guard();
  const p = await prisma.partenaire.findUnique({ where: { id }, select: { published: true } });
  if (p) await prisma.partenaire.update({ where: { id }, data: { published: !p.published } });
  revalidateVitrine("/partenaires");
}

/* ---------------- Actualités ---------------- */
export async function createActualite(formData: FormData): Promise<void> {
  await guard();
  const title = s(formData, "title");
  if (!title) return;
  let slug = slugify(title) || "actualite";
  let i = 2;
  while (await prisma.actualite.findUnique({ where: { slug }, select: { id: true } })) slug = `${slugify(title)}-${i++}`;
  const dateStr = s(formData, "publishedAt");
  await prisma.actualite.create({
    data: {
      slug,
      title,
      excerpt: s(formData, "excerpt"),
      category: s(formData, "category") || "Actualité",
      publishedAt: dateStr ? new Date(dateStr) : new Date(),
      readingTime: n(formData, "readingTime", 3),
    },
  });
  revalidateVitrine("/actualites");
}
export async function updateActualite(id: string, formData: FormData): Promise<void> {
  await guard();
  const dateStr = s(formData, "publishedAt");
  await prisma.actualite.update({
    where: { id },
    data: {
      title: s(formData, "title"),
      excerpt: s(formData, "excerpt"),
      category: s(formData, "category") || "Actualité",
      ...(dateStr ? { publishedAt: new Date(dateStr) } : {}),
      readingTime: n(formData, "readingTime", 3),
    },
  });
  revalidateVitrine("/actualites");
}
export async function deleteActualite(id: string): Promise<void> {
  await guard();
  await prisma.actualite.delete({ where: { id } });
  revalidateVitrine("/actualites");
}
export async function toggleActualite(id: string): Promise<void> {
  await guard();
  const a = await prisma.actualite.findUnique({ where: { id }, select: { published: true } });
  if (a) await prisma.actualite.update({ where: { id }, data: { published: !a.published } });
  revalidateVitrine("/actualites");
}

/* ---------------- Ressources ---------------- */
export async function createRessource(formData: FormData): Promise<void> {
  await guard();
  const title = s(formData, "title");
  if (!title) return;
  await prisma.ressource.create({
    data: { title, type: s(formData, "type") || "PDF", category: s(formData, "category") || "Document", size: s(formData, "size") || null, url: s(formData, "url") || null, order: n(formData, "order") },
  });
  revalidateVitrine("/ressources");
}
export async function updateRessource(id: string, formData: FormData): Promise<void> {
  await guard();
  await prisma.ressource.update({
    where: { id },
    data: { title: s(formData, "title"), type: s(formData, "type") || "PDF", category: s(formData, "category") || "Document", size: s(formData, "size") || null, url: s(formData, "url") || null, order: n(formData, "order") },
  });
  revalidateVitrine("/ressources");
}
export async function deleteRessource(id: string): Promise<void> {
  await guard();
  await prisma.ressource.delete({ where: { id } });
  revalidateVitrine("/ressources");
}
export async function toggleRessource(id: string): Promise<void> {
  await guard();
  const r = await prisma.ressource.findUnique({ where: { id }, select: { published: true } });
  if (r) await prisma.ressource.update({ where: { id }, data: { published: !r.published } });
  revalidateVitrine("/ressources");
}

/* ---------------- Témoignages ---------------- */
export async function createTemoignage(formData: FormData): Promise<void> {
  await guard();
  const name = s(formData, "name");
  const quote = s(formData, "quote");
  if (!name || !quote) return;
  await prisma.temoignage.create({
    data: { name, role: s(formData, "role"), college: s(formData, "college"), quote, initials: initialsOf(name), order: n(formData, "order") },
  });
  revalidateVitrine("/");
}
export async function updateTemoignage(id: string, formData: FormData): Promise<void> {
  await guard();
  const name = s(formData, "name");
  await prisma.temoignage.update({
    where: { id },
    data: { name, role: s(formData, "role"), college: s(formData, "college"), quote: s(formData, "quote"), initials: initialsOf(name), order: n(formData, "order") },
  });
  revalidateVitrine("/");
}
export async function deleteTemoignage(id: string): Promise<void> {
  await guard();
  await prisma.temoignage.delete({ where: { id } });
  revalidateVitrine("/");
}
export async function toggleTemoignage(id: string): Promise<void> {
  await guard();
  const t = await prisma.temoignage.findUnique({ where: { id }, select: { published: true } });
  if (t) await prisma.temoignage.update({ where: { id }, data: { published: !t.published } });
  revalidateVitrine("/");
}
