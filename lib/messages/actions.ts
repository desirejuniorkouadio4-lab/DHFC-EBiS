"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getContacts } from "@/lib/messages/db";

/** Démarre (ou rouvre) une conversation 1-à-1 avec un contact autorisé. */
export async function startConversation(formData: FormData): Promise<void> {
  const user = await requireUser();
  const recipientId = String(formData.get("recipientId") ?? "");
  if (!recipientId || recipientId === user.id) return;

  // Sécurité : on ne peut écrire qu'à un contact (cohorte commune).
  const contacts = await getContacts(user.id);
  if (!contacts.some((c) => c.id === recipientId)) return;

  // Réutilise une conversation 1-à-1 existante entre les deux utilisateurs.
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [{ participants: { some: { userId: user.id } } }, { participants: { some: { userId: recipientId } } }],
    },
    select: { id: true, participants: { select: { userId: true } } },
  });
  const oneToOne = existing && existing.participants.length === 2;

  let conversationId: string;
  if (oneToOne) {
    conversationId = existing.id;
  } else {
    const conv = await prisma.conversation.create({
      data: { participants: { create: [{ userId: user.id }, { userId: recipientId }] } },
      select: { id: true },
    });
    conversationId = conv.id;
  }
  redirect(`/messagerie/${conversationId}`);
}

/** Envoie un message dans une conversation. */
export async function sendMessage(conversationId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const part = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    select: { id: true },
  });
  if (!part) return; // non membre

  await prisma.$transaction([
    prisma.message.create({ data: { conversationId, senderId: user.id, body: body.slice(0, 5000) } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: user.id } },
      data: { lastReadAt: new Date() },
    }),
  ]);
  revalidatePath(`/messagerie/${conversationId}`);
  revalidatePath("/messagerie");
}

/** Marque une conversation comme lue pour l'utilisateur courant. */
export async function markConversationRead(conversationId: string): Promise<void> {
  const user = await requireUser();
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: user.id },
    data: { lastReadAt: new Date() },
  });
  revalidatePath("/messagerie");
}
