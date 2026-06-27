/**
 * Seed DHFC-EBiS — peuple la base avec les données de l'application.
 * Idempotent : vide les tables puis recrée tout.
 *   pnpm/npm : `npx prisma db seed`
 */
import { PrismaClient, Level, LessonType } from "@prisma/client";
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

  // --- Cohorte + apprenant de démo + inscriptions + progression ---
  const cohort = await prisma.cohort.create({ data: { name: "Cohorte Mars 2026 — PC/SVT" } });
  const user = await prisma.user.create({
    data: {
      email: "konan.yao@dhfc.dpfc.ci",
      firstName: "Konan",
      lastName: "Yao",
      role: "APPRENANT",
      bivalence: "PC · SVT",
      region: "Gôh",
      dren: "DREN de Daloa",
      college: "Collège Moderne de Daloa",
      xp: 1240,
      level: 5,
      streak: 6,
    },
  });

  // Badges obtenus (5 premiers)
  const earnedBadges = await prisma.badge.findMany({ where: { slug: { in: ["premier-pas", "streak-7", "quiz-parfait", "entraide", "diplome"] } } });
  for (const b of earnedBadges) {
    await prisma.userBadge.create({ data: { userId: user.id, badgeId: b.id } });
  }

  for (const e of ENROLLMENTS) {
    const parcours = await prisma.parcours.findUnique({ where: { slug: e.slug } });
    if (!parcours) continue;
    await prisma.enrollment.create({
      data: { userId: user.id, parcoursId: parcours.id, cohortId: cohort.id, tutorName: e.tutor, progress: e.baseline },
    });
    // Progression : marque les N premières leçons comme terminées
    const ids = lessonsBySlug[e.slug] ?? [];
    const count = Math.round((e.baseline / 100) * ids.length);
    for (let i = 0; i < count; i++) {
      await prisma.lessonProgress.create({
        data: { userId: user.id, lessonId: ids[i], completed: true, completedAt: new Date() },
      });
    }
  }

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
