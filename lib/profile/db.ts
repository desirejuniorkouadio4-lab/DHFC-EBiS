import "server-only";
import { prisma } from "@/lib/prisma";

export type ProfileData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  bivalence: string | null;
  region: string | null;
  dren: string | null;
  college: string | null;
  phone: string | null;
  bio: string | null;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
  // Confidentialité / RGPD
  profileVisibility: string;
  showInLeaderboard: boolean;
  allowMessages: boolean;
  showActivity: boolean;
  emailNotif: boolean;
  weeklyDigest: boolean;
  marketingConsent: boolean;
  // Résumé des données (pour la section RGPD)
  counts: { enrollments: number; completedLessons: number; certificates: number; badges: number; forumPosts: number; messages: number };
};

/** Profil complet de l'utilisateur connecté (édition + confidentialité). */
export async function getProfile(userId: string): Promise<ProfileData | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          enrollments: true,
          certificates: true,
          badges: true,
          forumPosts: true,
          sentMessages: true,
          progress: true,
        },
      },
    },
  });
  if (!u) return null;
  const completedLessons = await prisma.lessonProgress.count({ where: { userId, completed: true } });

  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    bivalence: u.bivalence,
    region: u.region,
    dren: u.dren,
    college: u.college,
    phone: u.phone,
    bio: u.bio,
    xp: u.xp,
    level: u.level,
    streak: u.streak,
    createdAt: u.createdAt.toISOString(),
    profileVisibility: u.profileVisibility,
    showInLeaderboard: u.showInLeaderboard,
    allowMessages: u.allowMessages,
    showActivity: u.showActivity,
    emailNotif: u.emailNotif,
    weeklyDigest: u.weeklyDigest,
    marketingConsent: u.marketingConsent,
    counts: {
      enrollments: u._count.enrollments,
      completedLessons,
      certificates: u._count.certificates,
      badges: u._count.badges,
      forumPosts: u._count.forumPosts,
      messages: u._count.sentMessages,
    },
  };
}
