import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Export RGPD : toutes les données personnelles de l'utilisateur (portabilité). */
export async function GET(): Promise<Response> {
  const actor = await getSessionUser();
  if (!actor) return new Response("Non autorisé", { status: 401 });

  const u = await prisma.user.findUnique({
    where: { id: actor.id },
    include: {
      enrollments: { select: { parcours: { select: { title: true } }, progress: true, enrolledAt: true } },
      progress: { select: { lesson: { select: { title: true } }, completed: true, completedAt: true, score: true } },
      certificates: { select: { code: true, score: true, issuedAt: true, parcours: { select: { title: true } } } },
      badges: { select: { badge: { select: { name: true } }, earnedAt: true } },
      forumPosts: { select: { body: true, createdAt: true } },
      submissions: { select: { prompt: true, answer: true, status: true, score: true, createdAt: true } },
      sentMessages: { select: { body: true, createdAt: true } },
    },
  });
  if (!u) return new Response("Introuvable", { status: 404 });

  const data = {
    exportInfo: {
      generatedAt: new Date().toISOString(),
      notice:
        "Export de vos données personnelles DHFC-EBiS (droit à la portabilité — RGPD / Loi 2013-450 CI).",
    },
    compte: {
      email: u.email,
      prenom: u.firstName,
      nom: u.lastName,
      role: u.role,
      bivalence: u.bivalence,
      region: u.region,
      dren: u.dren,
      college: u.college,
      telephone: u.phone,
      bio: u.bio,
      creeLe: u.createdAt,
    },
    confidentialite: {
      visibiliteProfil: u.profileVisibility,
      apparaitAuClassement: u.showInLeaderboard,
      autoriseLesMessages: u.allowMessages,
      activiteVisible: u.showActivity,
      notificationsEmail: u.emailNotif,
      digestHebdomadaire: u.weeklyDigest,
      consentementCommunications: u.marketingConsent,
    },
    gamification: { xp: u.xp, niveau: u.level, serie: u.streak },
    inscriptions: u.enrollments.map((e) => ({ parcours: e.parcours.title, progression: e.progress, inscritLe: e.enrolledAt })),
    progression: u.progress.map((p) => ({ lecon: p.lesson.title, termine: p.completed, le: p.completedAt, score: p.score })),
    certificats: u.certificates.map((c) => ({ parcours: c.parcours.title, code: c.code, score: c.score, delivreLe: c.issuedAt })),
    badges: u.badges.map((b) => ({ nom: b.badge.name, obtenuLe: b.earnedAt })),
    devoirs: u.submissions.map((s) => ({ enonce: s.prompt, reponse: s.answer, statut: s.status, note: s.score, le: s.createdAt })),
    messagesEnvoyes: u.sentMessages.map((m) => ({ contenu: m.body, le: m.createdAt })),
    posementsForum: u.forumPosts.map((f) => ({ contenu: f.body, le: f.createdAt })),
  };

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mes-donnees-dhfc-${date}.json"`,
    },
  });
}
