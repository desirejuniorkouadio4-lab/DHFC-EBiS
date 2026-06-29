/**
 * Seed DHFC-EBiS — peuple la base avec les données de l'application.
 * Idempotent : vide les tables puis recrée tout.
 *   pnpm/npm : `npx prisma db seed`
 */
import { PrismaClient, Level, LessonType } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DISCIPLINES,
  PARCOURS,
  ACTUALITES,
  PARTENAIRES,
  TEMOIGNAGES,
} from "../lib/data";

const prisma = new PrismaClient();

const DISCIPLINE_ICON: Record<string, string> = {
  mathematiques: "Sigma",
  tice: "MonitorSmartphone",
  "physique-chimie": "Atom",
  svt: "Leaf",
};

const LEVEL_MAP: Record<string, Level> = {
  Débutant: "DEBUTANT",
  Intermédiaire: "INTERMEDIAIRE",
  Avancé: "AVANCE",
};

const MODULE_THEMES = [
  "Fondamentaux et cadrage",
  "Approfondissement disciplinaire",
  "Pédagogie et mise en situation",
  "Évaluation et différenciation",
  "Numérique et ressources",
  "Projet final et bilan",
];
const LESSON_TITLES = [
  "Introduction et objectifs",
  "Notions clés",
  "Étude de cas en classe",
  "Atelier pratique",
  "Pour aller plus loin",
];

const BADGES = [
  { slug: "premier-pas", name: "Premier pas", description: "Terminer sa 1ʳᵉ leçon", icon: "Sparkles", rarity: "commun" },
  { slug: "streak-7", name: "Assidu", description: "Se connecter 6 jours d'affilée", icon: "Flame", rarity: "rare" },
  { slug: "quiz-parfait", name: "Sans faute", description: "100 % à un quiz", icon: "Target", rarity: "rare" },
  { slug: "entraide", name: "Entraide", description: "10 réponses utiles au forum", icon: "Users", rarity: "épique" },
  { slug: "diplome", name: "Diplômé", description: "Obtenir un 1ᵉʳ certificat", icon: "Award", rarity: "épique" },
  { slug: "polyglotte", name: "Polyvalent", description: "Finir un parcours dans 2 disciplines", icon: "BookOpenCheck", rarity: "légendaire" },
];

const ENROLLMENTS = [
  { slug: "experimentation-physique-chimie", cohort: "Cohorte Mars 2026 — PC/SVT", tutor: "Fatou Diabaté", baseline: 45 },
  { slug: "vivant-environnement-svt", cohort: "Cohorte Mars 2026 — PC/SVT", tutor: "Fatou Diabaté", baseline: 80 },
  { slug: "evaluer-par-competences", cohort: "Cohorte Mars 2026 — Transversal", tutor: "Brou Kouassi", baseline: 15 },
];

function lessonContent(type: LessonType, moduleTitle: string) {
  if (type === "VIDEO") {
    return {
      kind: "video",
      intro: `Vidéo d'introduction au ${moduleTitle}, avec des exemples concrets de classe.`,
      chapters: [
        { time: "00:00", label: "Introduction" },
        { time: "02:15", label: "Concepts clés" },
        { time: "05:40", label: "Exemple en situation" },
      ],
      transcript: "Transcription disponible pour cette séquence vidéo.",
    };
  }
  if (type === "QUIZ") {
    return {
      kind: "quiz",
      intro: "Validez vos acquis sur ce module.",
      questions: [
        {
          question: "Quel est l'objectif d'une pédagogie active ?",
          options: ["Transmettre vite", "Rendre l'élève acteur", "Garder le calme", "Noter uniquement"],
          correct: 1,
        },
      ],
    };
  }
  return {
    kind: "texte",
    sections: [
      { heading: "Ce que vous allez apprendre", body: [`Apports théoriques du ${moduleTitle}.`] },
      { heading: "Application en classe", body: ["Transposition concrète avec vos élèves."] },
    ],
  };
}

async function main() {
  console.log("🌱 Seed DHFC-EBiS…");

  // --- Nettoyage (ordre des dépendances) ---
  await prisma.submission.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.parcours.deleteMany();
  await prisma.discipline.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.user.deleteMany();
  await prisma.actualite.deleteMany();
  await prisma.partenaire.deleteMany();
  await prisma.temoignage.deleteMany();

  // --- Disciplines ---
  for (const d of DISCIPLINES) {
    await prisma.discipline.create({
      data: { slug: d.slug, name: d.name, short: d.short, color: d.color, bivalence: d.bivalence, icon: DISCIPLINE_ICON[d.slug] ?? "BookOpen" },
    });
  }

  // --- Parcours + modules + leçons ---
  const lessonsBySlug: Record<string, string[]> = {};
  for (const p of PARCOURS) {
    const disc = await prisma.discipline.findUnique({ where: { slug: p.disciplineSlug } });
    if (!disc) continue;
    const parcours = await prisma.parcours.create({
      data: {
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        disciplineId: disc.id,
        level: LEVEL_MAP[p.level],
        durationHours: p.durationHours,
        ratingAvg: p.rating,
        reviewsCount: p.reviews,
        enrolledCount: p.enrolled,
        isNew: p.isNew ?? false,
        objectives: p.objectives,
        prerequisites: p.prerequisites,
        tags: p.tags,
      },
    });

    const perModule = Math.max(3, Math.round(p.lessons / p.modules));
    const orderedLessonIds: string[] = [];
    for (let m = 0; m < p.modules; m++) {
      const moduleTitle = `Module ${m + 1} — ${MODULE_THEMES[m % MODULE_THEMES.length]}`;
      const mod = await prisma.module.create({
        data: { parcoursId: parcours.id, index: m, title: moduleTitle },
      });
      for (let l = 0; l < perModule; l++) {
        const isLast = l === perModule - 1;
        const type: LessonType = isLast ? "QUIZ" : l % 3 === 0 ? "VIDEO" : "TEXTE";
        const title = isLast ? "Quiz de validation" : LESSON_TITLES[l % LESSON_TITLES.length];
        const durationMin = type === "VIDEO" ? 8 : type === "QUIZ" ? 10 : 12;
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            index: l,
            title,
            type,
            durationMin,
            content: lessonContent(type, moduleTitle),
          },
        });
        orderedLessonIds.push(lesson.id);
      }
    }
    lessonsBySlug[p.slug] = orderedLessonIds;
  }

  // --- Badges ---
  for (const b of BADGES) {
    await prisma.badge.create({ data: b });
  }

  // --- Actualités / Partenaires / Témoignages ---
  for (const a of ACTUALITES) {
    await prisma.actualite.create({
      data: { slug: a.slug, title: a.title, excerpt: a.excerpt, category: a.category, publishedAt: new Date(a.date), readingTime: a.readingTime },
    });
  }
  for (let i = 0; i < PARTENAIRES.length; i++) {
    const p = PARTENAIRES[i];
    await prisma.partenaire.create({ data: { acronym: p.acronym, name: p.name, role: p.role, order: i } });
  }
  for (let i = 0; i < TEMOIGNAGES.length; i++) {
    const t = TEMOIGNAGES[i];
    await prisma.temoignage.create({ data: { name: t.name, role: t.role, college: t.college, quote: t.quote, initials: t.initials, order: i } });
  }

  // --- Comptes staff (créés d'abord : le tuteur est rattaché aux cohortes) ---
  const staffPassword = await bcrypt.hash("demo1234", 10);
  const staffData = [
    { email: "tuteur@dhfc.dpfc.ci", firstName: "Fatou", lastName: "Diabaté", role: "TUTEUR" as const },
    { email: "concepteur@dhfc.dpfc.ci", firstName: "Awa", lastName: "Touré", role: "CONCEPTEUR" as const },
    { email: "encadreur@dhfc.dpfc.ci", firstName: "Seydou", lastName: "Koné", role: "ENCADREUR" as const },
    { email: "admin@dhfc.dpfc.ci", firstName: "Admin", lastName: "DPFC", role: "ADMIN" as const },
  ];
  let tutorId = "";
  for (const s of staffData) {
    const u = await prisma.user.create({
      data: { ...s, passwordHash: staffPassword, bivalence: "PC · SVT", region: "Abidjan", dren: "DREN Abidjan 2", college: "DPFC — Plateau" },
    });
    if (s.role === "TUTEUR") tutorId = u.id;
  }
  const TUTOR_NAME = "Fatou Diabaté";

  // Second tuteur (pour la comparaison côté encadreur).
  const tutor2 = await prisma.user.create({
    data: { email: "tuteur2@dhfc.dpfc.ci", passwordHash: staffPassword, firstName: "Brou", lastName: "Kouassi", role: "TUTEUR", bivalence: "Maths · TICE", region: "Abidjan", dren: "DREN Abidjan 4", college: "DPFC — Plateau" },
  });
  const TUTOR2_NAME = "Brou Kouassi";

  // --- Cohortes (tuteurs attitrés : Fatou → PC/SVT, Brou → Transversal) ---
  const cohortPCSVT = await prisma.cohort.create({ data: { name: "Cohorte Mars 2026 — PC/SVT", tutorId } });
  const cohortTransversal = await prisma.cohort.create({ data: { name: "Cohorte Mars 2026 — Transversal", tutorId: tutor2.id } });
  const tutorNameByCohort: Record<string, string> = { [cohortPCSVT.id]: TUTOR_NAME, [cohortTransversal.id]: TUTOR2_NAME };

  // Inscrit un apprenant à un parcours + génère sa progression (date de dernière activité).
  async function enrollLearner(userId: string, slug: string, cohortId: string, baseline: number, lastActiveDaysAgo: number) {
    const parcours = await prisma.parcours.findUnique({ where: { slug } });
    if (!parcours) return;
    await prisma.enrollment.create({
      data: { userId, parcoursId: parcours.id, cohortId, tutorName: tutorNameByCohort[cohortId] ?? TUTOR_NAME, progress: baseline },
    });
    const ids = lessonsBySlug[slug] ?? [];
    const count = Math.round((baseline / 100) * ids.length);
    const when = new Date(Date.now() - lastActiveDaysAgo * 86400000);
    for (let i = 0; i < count; i++) {
      await prisma.lessonProgress.create({
        data: { userId, lessonId: ids[i], completed: true, completedAt: when },
      });
    }
  }

  // --- Apprenant de démo (Konan Yao) ---
  const user = await prisma.user.create({
    data: { email: "konan.yao@dhfc.dpfc.ci", passwordHash: await bcrypt.hash("demo1234", 10), firstName: "Konan", lastName: "Yao", role: "APPRENANT", bivalence: "PC · SVT", region: "Gôh", dren: "DREN de Daloa", college: "Collège Moderne de Daloa", xp: 1240, level: 5, streak: 6 },
  });
  const earnedBadges = await prisma.badge.findMany({ where: { slug: { in: ["premier-pas", "streak-7", "quiz-parfait", "entraide", "diplome"] } } });
  for (const b of earnedBadges) await prisma.userBadge.create({ data: { userId: user.id, badgeId: b.id } });
  await enrollLearner(user.id, "experimentation-physique-chimie", cohortPCSVT.id, 45, 0);
  await enrollLearner(user.id, "vivant-environnement-svt", cohortPCSVT.id, 100, 2);
  await enrollLearner(user.id, "evaluer-par-competences", cohortTransversal.id, 15, 1);

  // --- Cohortes garnies : autres apprenants pour le suivi tuteur ---
  const learners = [
    { first: "Aya", last: "Koffi", college: "Collège Moderne de Bouaké", region: "Gbêkê", slug: "experimentation-physique-chimie", cohort: cohortPCSVT.id, baseline: 62, days: 1 },
    { first: "Ibrahim", last: "Traoré", college: "Lycée Moderne de Korhogo", region: "Poro", slug: "experimentation-physique-chimie", cohort: cohortPCSVT.id, baseline: 100, days: 2 },
    { first: "Mariam", last: "Bamba", college: "Collège Moderne de Man", region: "Tonkpi", slug: "vivant-environnement-svt", cohort: cohortPCSVT.id, baseline: 30, days: 12 },
    { first: "Yao", last: "N'Guessan", college: "Lycée Municipal de Yamoussoukro", region: "Bélier", slug: "vivant-environnement-svt", cohort: cohortPCSVT.id, baseline: 8, days: 21 },
    { first: "Fatoumata", last: "Cissé", college: "Collège Moderne de San-Pédro", region: "San-Pédro", slug: "experimentation-physique-chimie", cohort: cohortPCSVT.id, baseline: 54, days: 3 },
    { first: "Kouadio", last: "Brou", college: "Lycée Moderne de Gagnoa", region: "Gôh", slug: "evaluer-par-competences", cohort: cohortTransversal.id, baseline: 90, days: 0 },
    { first: "Awa", last: "Sylla", college: "Collège Moderne d'Abengourou", region: "Indénié-Djuablin", slug: "evaluer-par-competences", cohort: cohortTransversal.id, baseline: 40, days: 9 },
    { first: "Seydou", last: "Ouattara", college: "Lycée Moderne de Daloa", region: "Haut-Sassandra", slug: "evaluer-par-competences", cohort: cohortTransversal.id, baseline: 5, days: 30 },
    { first: "Adjoua", last: "Kouamé", college: "Collège Moderne de Divo", region: "Lôh-Djiboua", slug: "experimentation-physique-chimie", cohort: cohortPCSVT.id, baseline: 72, days: 4 },
  ];
  let learnerSeq = 1;
  let firstLearnerId = "";
  for (const l of learners) {
    const lu = await prisma.user.create({
      data: { email: `apprenant${learnerSeq++}@dhfc.dpfc.ci`, passwordHash: staffPassword, firstName: l.first, lastName: l.last, role: "APPRENANT", bivalence: "PC · SVT", region: l.region, dren: `DREN — ${l.region}`, college: l.college, xp: l.baseline * 12, level: 1 + Math.floor(l.baseline / 25), streak: l.days <= 1 ? 4 : 0 },
    });
    if (!firstLearnerId) firstLearnerId = lu.id;
    await enrollLearner(lu.id, l.slug, l.cohort, l.baseline, l.days);
  }

  // --- Forums : discussions de démo ---
  const t1 = await prisma.forumThread.create({
    data: {
      authorId: tutorId,
      title: "Bienvenue sur les forums DHFC-EBiS 👋",
      body: "Cet espace est dédié à l'entraide entre enseignants. Posez vos questions, partagez vos ressources et vos retours d'expérience. Restons bienveillants et constructifs !",
      pinned: true,
    },
  });
  await prisma.forumPost.create({
    data: { threadId: t1.id, authorId: user.id, body: "Merci pour cet espace, hâte d'échanger avec la cohorte !" },
  });

  const pcPlus = await prisma.parcours.findUnique({ where: { slug: "experimentation-physique-chimie" }, select: { id: true } });
  const t2 = await prisma.forumThread.create({
    data: {
      authorId: user.id,
      parcoursId: pcPlus?.id ?? null,
      title: "Matériel pour la démarche d'investigation en classe surchargée",
      body: "Bonjour, comment organisez-vous les manipulations quand on a 50 élèves et peu de matériel ? Je cherche des idées de rotation par îlots.",
    },
  });
  await prisma.forumPost.create({
    data: { threadId: t2.id, authorId: tutorId, body: "Très bonne question. Je conseille des stations tournantes de 6-8 élèves avec une fiche de rôle. Je partage un modèle en visio cette semaine." },
  });
  if (firstLearnerId) {
    await prisma.forumPost.create({
      data: { threadId: t2.id, authorId: firstLearnerId, body: "De mon côté je filme une manip et les élèves analysent en groupe, ça aide quand le matériel manque." },
    });
  }

  // --- Certificats : délivrés pour chaque parcours terminé (100 %) ---
  const completed = await prisma.enrollment.findMany({
    where: { progress: { gte: 100 } },
    select: { userId: true, parcoursId: true, enrolledAt: true },
  });
  let certSeq = 0;
  for (const e of completed) {
    const code = `DHFC-26-${(certSeq++).toString(36).toUpperCase().padStart(2, "0")}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await prisma.certificate.create({
      data: {
        userId: e.userId,
        parcoursId: e.parcoursId,
        code,
        score: 85 + Math.floor(Math.random() * 11), // 85–95
        issuedAt: new Date(Date.now() - 3 * 86400000),
      },
    });
  }

  // --- Messagerie : conversation de démo (Konan ↔ Fatou) ---
  const conv = await prisma.conversation.create({
    data: { participants: { create: [{ userId: user.id }, { userId: tutorId }] }, lastMessageAt: new Date(Date.now() - 3600000) },
  });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: user.id, body: "Bonjour Mme Diabaté, j'ai une question sur le devoir du module 2.", createdAt: new Date(Date.now() - 7200000) } });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: tutorId, body: "Bonjour Konan, bien sûr, je vous écoute. N'hésitez pas à préciser sur quel point vous bloquez.", createdAt: new Date(Date.now() - 3600000) } });

  // --- Récap ---
  const counts = {
    disciplines: await prisma.discipline.count(),
    parcours: await prisma.parcours.count(),
    modules: await prisma.module.count(),
    lessons: await prisma.lesson.count(),
    badges: await prisma.badge.count(),
    actualites: await prisma.actualite.count(),
    partenaires: await prisma.partenaire.count(),
    temoignages: await prisma.temoignage.count(),
    users: await prisma.user.count(),
    enrollments: await prisma.enrollment.count(),
    lessonProgress: await prisma.lessonProgress.count(),
    certificates: await prisma.certificate.count(),
    forumThreads: await prisma.forumThread.count(),
  };
  console.log("✅ Seed terminé :", counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed échoué :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
