import { prisma } from "@/lib/prisma";

/** Accès aux forums (§14.2). Discussions par parcours ou générales + réponses. */

export type ThreadListItem = {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorRole: string;
  parcoursTitle: string | null;
  pinned: boolean;
  locked: boolean;
  replyCount: number;
  lastActivityAt: Date;
  createdAt: Date;
};

function excerpt(body: string, n = 140): string {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length > n ? t.slice(0, n) + "…" : t;
}

/** Liste des discussions (épinglées en tête), filtrable par parcours. */
export async function listThreads(opts: { parcoursSlug?: string } = {}): Promise<ThreadListItem[]> {
  const rows = await prisma.forumThread.findMany({
    where: {
      deletedAt: null,
      ...(opts.parcoursSlug ? { parcours: { slug: opts.parcoursSlug } } : {}),
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      body: true,
      pinned: true,
      locked: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { firstName: true, lastName: true, role: true } },
      parcours: { select: { title: true } },
      posts: { where: { deletedAt: null }, select: { createdAt: true } },
    },
  });
  return rows
    .map((t) => {
      const lastPost = t.posts.reduce<Date | null>((acc, p) => (!acc || p.createdAt > acc ? p.createdAt : acc), null);
      return {
        id: t.id,
        title: t.title,
        excerpt: excerpt(t.body),
        authorName: `${t.author.firstName} ${t.author.lastName}`,
        authorRole: t.author.role,
        parcoursTitle: t.parcours?.title ?? null,
        pinned: t.pinned,
        locked: t.locked,
        replyCount: t.posts.length,
        lastActivityAt: lastPost ?? t.createdAt,
        createdAt: t.createdAt,
      };
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.lastActivityAt.getTime() - a.lastActivityAt.getTime();
    });
}

export type ThreadPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  body: string;
  createdAt: Date;
  authorId: string;
};

export type ThreadDetail = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  parcoursTitle: string | null;
  pinned: boolean;
  locked: boolean;
  createdAt: Date;
  posts: ThreadPost[];
};

function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export async function getThread(id: string): Promise<ThreadDetail | null> {
  const t = await prisma.forumThread.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      body: true,
      pinned: true,
      locked: true,
      createdAt: true,
      authorId: true,
      author: { select: { firstName: true, lastName: true, role: true } },
      parcours: { select: { title: true } },
      posts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          authorId: true,
          author: { select: { firstName: true, lastName: true, role: true } },
        },
      },
    },
  });
  if (!t) return null;
  return {
    id: t.id,
    title: t.title,
    body: t.body,
    authorId: t.authorId,
    authorName: `${t.author.firstName} ${t.author.lastName}`,
    authorInitials: initials(t.author.firstName, t.author.lastName),
    authorRole: t.author.role,
    parcoursTitle: t.parcours?.title ?? null,
    pinned: t.pinned,
    locked: t.locked,
    createdAt: t.createdAt,
    posts: t.posts.map((p) => ({
      id: p.id,
      authorId: p.authorId,
      authorName: `${p.author.firstName} ${p.author.lastName}`,
      authorInitials: initials(p.author.firstName, p.author.lastName),
      authorRole: p.author.role,
      body: p.body,
      createdAt: p.createdAt,
    })),
  };
}

export type ForumParcoursOption = { slug: string; title: string };

/** Parcours proposés comme catégories de forum (publiés). */
export async function listForumParcours(): Promise<ForumParcoursOption[]> {
  return prisma.parcours.findMany({
    where: { published: true },
    orderBy: { title: "asc" },
    select: { slug: true, title: true },
  });
}
