import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/** Couche d'accès du back-office administrateur (§17). */

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  byRole: Record<string, number>;
  learners: number;
  activeLast7d: number;
  enrollments: number;
  avgCompletion: number;
  pendingCorrections: number;
  publishedParcours: number;
  draftParcours: number;
  cohorts: number;
  recentSignups: { id: string; name: string; role: Role; createdAt: Date }[];
  topParcours: { slug: string; title: string; enrolled: number }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const since = new Date(Date.now() - 7 * 86400000);
  const [
    totalUsers,
    activeUsers,
    roleGroups,
    enrollments,
    completion,
    pendingCorrections,
    publishedParcours,
    draftParcours,
    cohorts,
    activeRows,
    recent,
    parcours,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.enrollment.count(),
    prisma.enrollment.aggregate({ _avg: { progress: true } }),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.parcours.count({ where: { published: true } }),
    prisma.parcours.count({ where: { published: false } }),
    prisma.cohort.count(),
    prisma.lessonProgress.findMany({
      where: { completedAt: { gte: since } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, role: true, createdAt: true },
    }),
    prisma.parcours.findMany({
      select: { slug: true, title: true, _count: { select: { enrollments: true } } },
    }),
  ]);

  const byRole: Record<string, number> = {};
  for (const g of roleGroups) byRole[g.role] = g._count._all;

  const topParcours = parcours
    .map((p) => ({ slug: p.slug, title: p.title, enrolled: p._count.enrollments }))
    .sort((a, b) => b.enrolled - a.enrolled)
    .slice(0, 5);

  return {
    totalUsers,
    activeUsers,
    byRole,
    learners: byRole["APPRENANT"] ?? 0,
    activeLast7d: activeRows.length,
    enrollments,
    avgCompletion: Math.round(completion._avg.progress ?? 0),
    pendingCorrections,
    publishedParcours,
    draftParcours,
    cohorts,
    recentSignups: recent.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role,
      createdAt: u.createdAt,
    })),
    topParcours,
  };
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  region: string | null;
  college: string | null;
  active: boolean;
  createdAt: Date;
};

/** Liste des utilisateurs avec recherche et filtre de rôle. */
export async function listUsers(opts: { q?: string; role?: string } = {}): Promise<AdminUser[]> {
  const q = opts.q?.trim();
  const role = opts.role && opts.role !== "ALL" ? (opts.role as Role) : undefined;
  const rows = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      region: true,
      college: true,
      active: true,
      createdAt: true,
    },
  });
  return rows.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
    region: u.region,
    college: u.college,
    active: u.active,
    createdAt: u.createdAt,
  }));
}

export type AdminCohort = {
  id: string;
  name: string;
  tutorId: string | null;
  tutorName: string | null;
  learnerCount: number;
  parcoursCount: number;
  createdAt: Date;
};

export async function listCohortsAdmin(): Promise<AdminCohort[]> {
  const rows = await prisma.cohort.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      tutorId: true,
      tutor: { select: { firstName: true, lastName: true } },
      enrollments: { select: { userId: true, parcoursId: true } },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    tutorId: c.tutorId,
    tutorName: c.tutor ? `${c.tutor.firstName} ${c.tutor.lastName}` : null,
    learnerCount: new Set(c.enrollments.map((e) => e.userId)).size,
    parcoursCount: new Set(c.enrollments.map((e) => e.parcoursId)).size,
    createdAt: c.createdAt,
  }));
}

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: Date;
};

export async function listMedia(): Promise<MediaItem[]> {
  return prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, filename: true, contentType: true, size: true, createdAt: true },
  });
}

export type TutorOption = { id: string; name: string };

/** Tuteurs et encadreurs (pour l'affectation aux cohortes). */
export async function listTutors(): Promise<TutorOption[]> {
  const rows = await prisma.user.findMany({
    where: { role: { in: ["TUTEUR", "ENCADREUR"] }, active: true },
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true, role: true },
  });
  return rows.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName} (${u.role === "TUTEUR" ? "tuteur" : "encadreur"})` }));
}
