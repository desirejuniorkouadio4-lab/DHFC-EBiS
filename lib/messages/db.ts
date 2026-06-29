import { prisma } from "@/lib/prisma";

/** Messagerie privée (§14.3). Conversations 1-à-1 entre membres d'une même cohorte. */

export type Contact = { id: string; name: string; role: string };

/** Cohortes de l'utilisateur (inscrit ou tuteur attitré). */
async function cohortIdsOf(userId: string): Promise<string[]> {
  const [enrolled, tutored] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId }, select: { cohortId: true } }),
    prisma.cohort.findMany({ where: { tutorId: userId }, select: { id: true } }),
  ]);
  const ids = new Set<string>();
  for (const e of enrolled) if (e.cohortId) ids.add(e.cohortId);
  for (const c of tutored) ids.add(c.id);
  return [...ids];
}

/** Contacts joignables : membres et tuteurs des cohortes communes (hors soi-même). */
export async function getContacts(userId: string): Promise<Contact[]> {
  const cohortIds = await cohortIdsOf(userId);
  if (cohortIds.length === 0) return [];

  const [enrollments, cohorts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { cohortId: { in: cohortIds } },
      select: { user: { select: { id: true, firstName: true, lastName: true, role: true, active: true } } },
    }),
    prisma.cohort.findMany({
      where: { id: { in: cohortIds } },
      select: { tutor: { select: { id: true, firstName: true, lastName: true, role: true, active: true } } },
    }),
  ]);

  const map = new Map<string, Contact>();
  const add = (u: { id: string; firstName: string; lastName: string; role: string; active: boolean } | null) => {
    if (!u || !u.active || u.id === userId) return;
    map.set(u.id, { id: u.id, name: `${u.firstName} ${u.lastName}`, role: u.role });
  };
  for (const e of enrollments) add(e.user);
  for (const c of cohorts) add(c.tutor);
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

export type ConversationListItem = {
  id: string;
  otherName: string;
  otherInitials: string;
  otherRole: string;
  lastMessage: string;
  lastMessageAt: Date;
  fromMe: boolean;
  unread: boolean;
};

export async function listConversations(userId: string): Promise<ConversationListItem[]> {
  const parts = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: {
      lastReadAt: true,
      conversation: {
        select: {
          id: true,
          lastMessageAt: true,
          participants: { select: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, senderId: true } },
        },
      },
    },
  });

  return parts
    .map((p) => {
      const c = p.conversation;
      const other = c.participants.map((x) => x.user).find((u) => u.id !== userId);
      const last = c.messages[0];
      const otherName = other ? `${other.firstName} ${other.lastName}` : "Conversation";
      return {
        id: c.id,
        otherName,
        otherInitials: initials(otherName),
        otherRole: other?.role ?? "",
        lastMessage: last?.body ?? "",
        lastMessageAt: c.lastMessageAt,
        fromMe: last?.senderId === userId,
        unread: !!last && last.senderId !== userId && (!p.lastReadAt || last.createdAt > p.lastReadAt),
      };
    })
    .filter((c) => c.lastMessage !== "")
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}

export type ConversationMessage = { id: string; body: string; createdAt: Date; fromMe: boolean };
export type ConversationDetail = {
  id: string;
  otherName: string;
  otherInitials: string;
  otherRole: string;
  messages: ConversationMessage[];
};

/** Détail d'une conversation (si l'utilisateur en est membre), sinon null. */
export async function getConversation(conversationId: string, userId: string): Promise<ConversationDetail | null> {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      participants: { select: { userId: true, user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
      messages: { orderBy: { createdAt: "asc" }, select: { id: true, body: true, createdAt: true, senderId: true } },
    },
  });
  if (!c || !c.participants.some((p) => p.userId === userId)) return null;

  const other = c.participants.map((p) => p.user).find((u) => u.id !== userId);
  const otherName = other ? `${other.firstName} ${other.lastName}` : "Conversation";
  return {
    id: c.id,
    otherName,
    otherInitials: initials(otherName),
    otherRole: other?.role ?? "",
    messages: c.messages.map((m) => ({ id: m.id, body: m.body, createdAt: m.createdAt, fromMe: m.senderId === userId })),
  };
}

/** Nombre de conversations avec des messages non lus (badge). */
export async function unreadConversationsCount(userId: string): Promise<number> {
  const list = await listConversations(userId);
  return list.filter((c) => c.unread).length;
}
