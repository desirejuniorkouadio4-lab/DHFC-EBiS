"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

/** Le personnel (non-apprenant) peut modérer (épingler, verrouiller, supprimer tout). */
function isStaff(role: string): boolean {
  return role !== "APPRENANT";
}

/** Crée une discussion. */
export async function createThread(formData: FormData): Promise<void> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  const slug = String(formData.get("parcoursSlug") ?? "");
  const parcoursId = slug
    ? (await prisma.parcours.findUnique({ where: { slug }, select: { id: true } }))?.id ?? null
    : null;

  const thread = await prisma.forumThread.create({
    data: { title: title.slice(0, 160), body: body.slice(0, 5000), authorId: user.id, parcoursId },
    select: { id: true },
  });
  revalidatePath("/forums");
  redirect(`/forums/${thread.id}`);
}

/** Ajoute une réponse à une discussion. */
export async function createPost(threadId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const thread = await prisma.forumThread.findUnique({
    where: { id: threadId },
    select: { locked: true, deletedAt: true },
  });
  if (!thread || thread.deletedAt) return;
  if (thread.locked && !isStaff(user.role)) return; // discussion verrouillée

  await prisma.forumPost.create({ data: { threadId, authorId: user.id, body: body.slice(0, 5000) } });
  await prisma.forumThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
  revalidatePath(`/forums/${threadId}`);
  revalidatePath("/forums");
}

export async function togglePin(threadId: string): Promise<void> {
  const user = await requireUser();
  if (!isStaff(user.role)) return;
  const t = await prisma.forumThread.findUnique({ where: { id: threadId }, select: { pinned: true } });
  if (!t) return;
  await prisma.forumThread.update({ where: { id: threadId }, data: { pinned: !t.pinned } });
  revalidatePath(`/forums/${threadId}`);
  revalidatePath("/forums");
}

export async function toggleLock(threadId: string): Promise<void> {
  const user = await requireUser();
  if (!isStaff(user.role)) return;
  const t = await prisma.forumThread.findUnique({ where: { id: threadId }, select: { locked: true } });
  if (!t) return;
  await prisma.forumThread.update({ where: { id: threadId }, data: { locked: !t.locked } });
  revalidatePath(`/forums/${threadId}`);
}

/** Suppression douce d'une discussion (auteur ou personnel). */
export async function deleteThread(threadId: string): Promise<void> {
  const user = await requireUser();
  const t = await prisma.forumThread.findUnique({ where: { id: threadId }, select: { authorId: true } });
  if (!t) return;
  if (t.authorId !== user.id && !isStaff(user.role)) return;
  await prisma.forumThread.update({ where: { id: threadId }, data: { deletedAt: new Date() } });
  revalidatePath("/forums");
  redirect("/forums");
}

/** Suppression douce d'une réponse (auteur ou personnel). */
export async function deletePost(postId: string): Promise<void> {
  const user = await requireUser();
  const p = await prisma.forumPost.findUnique({ where: { id: postId }, select: { authorId: true, threadId: true } });
  if (!p) return;
  if (p.authorId !== user.id && !isStaff(user.role)) return;
  await prisma.forumPost.update({ where: { id: postId }, data: { deletedAt: new Date() } });
  revalidatePath(`/forums/${p.threadId}`);
}
