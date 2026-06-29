/**
 * Génère un curriculum (modules → leçons avec contenu) de manière déterministe
 * pour chaque parcours. Dans la version cible, ces données viendront de la base
 * PostgreSQL (cf. cahier §8 / §11).
 */

import { PARCOURS, DISCIPLINES, type Parcours } from "@/lib/data";
import type { CompletionRule, AccessRule } from "@/lib/completion/types";

export type LessonType = "video" | "texte" | "quiz";

export type Chapter = { time: string; label: string };
export type QuizQuestion = { question: string; options: string[]; correct: number };

export type LessonContent =
  | { kind: "video"; intro: string; chapters: Chapter[]; transcript: string }
  | { kind: "texte"; sections: { heading: string; body: string[] }[] }
  | { kind: "quiz"; intro: string; questions: QuizQuestion[] };

export type Resource = { title: string; type: string; size: string };

export type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  durationMin: number;
  moduleIndex: number;
  moduleTitle: string;
  objectives: string[];
  content: LessonContent;
  resources: Resource[];
  completion?: CompletionRule;
  access?: AccessRule;
};

export type CurriculumModule = {
  index: number;
  title: string;
  lessons: Lesson[];
  access?: AccessRule;
};

export type Curriculum = {
  slug: string;
  title: string;
  modules: CurriculumModule[];
  flat: Lesson[];
  totalLessons: number;
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
  "Quiz de validation",
];

const TYPE_CYCLE: LessonType[] = ["video", "texte", "texte", "video", "texte", "quiz"];

function videoContent(parcours: Parcours, moduleTitle: string): LessonContent {
  return {
    kind: "video",
    intro: `Cette séquence vidéo introduit les notions essentielles du module « ${moduleTitle} » à travers des exemples concrets issus des classes de collège ivoiriennes.`,
    chapters: [
      { time: "00:00", label: "Introduction" },
      { time: "02:15", label: "Concepts clés" },
      { time: "05:40", label: "Exemple en situation" },
      { time: "08:10", label: "Synthèse" },
    ],
    transcript: `Bonjour et bienvenue dans ce module du parcours « ${parcours.title} ». Dans cette vidéo, nous allons explorer ensemble les notions fondamentales, puis les mettre en perspective avec votre pratique de classe. Prenez le temps de noter vos questions : vous pourrez les partager avec votre tuteur et la communauté dans l'onglet Discussion.`,
  };
}

function texteContent(parcours: Parcours, moduleTitle: string): LessonContent {
  return {
    kind: "texte",
    sections: [
      {
        heading: "Ce que vous allez apprendre",
        body: [
          `Dans cette leçon du module « ${moduleTitle} », nous approfondissons les apports théoriques nécessaires à une pratique de classe efficace.`,
          `L'objectif est de relier les savoirs disciplinaires aux gestes professionnels, afin de transformer durablement vos séances avec vos élèves.`,
        ],
      },
      {
        heading: "Les points essentiels",
        body: [
          `Chaque notion est illustrée par une situation concrète, transposable dans le contexte des collèges de proximité.`,
          `Nous insistons sur la progressivité des apprentissages et sur la prise en compte de l'hétérogénéité des classes.`,
        ],
      },
      {
        heading: "Application en classe",
        body: [
          `À l'issue de cette leçon, vous serez en mesure de concevoir une activité adaptée à vos élèves et d'anticiper leurs difficultés courantes.`,
        ],
      },
    ],
  };
}

function quizContent(parcours: Parcours): LessonContent {
  const discipline = DISCIPLINES.find((d) => d.slug === parcours.disciplineSlug);
  return {
    kind: "quiz",
    intro: `Validez vos acquis sur ce module en répondant à ces quelques questions. Ce quiz est sans enjeu : il vous aide à mesurer votre compréhension avant de poursuivre.`,
    questions: [
      {
        question: `Quel est l'objectif principal d'une démarche pédagogique active en ${discipline?.short ?? "sciences"} ?`,
        options: [
          "Transmettre un maximum de contenu en un minimum de temps",
          "Rendre l'élève acteur de la construction de ses savoirs",
          "Limiter les interactions pour garder le calme",
          "Évaluer uniquement par des notes chiffrées",
        ],
        correct: 1,
      },
      {
        question: "Comment prendre en compte l'hétérogénéité d'une classe nombreuse ?",
        options: [
          "En proposant la même tâche, sans adaptation",
          "En différenciant supports, consignes et accompagnement",
          "En ne s'adressant qu'aux meilleurs élèves",
          "En supprimant toute évaluation",
        ],
        correct: 1,
      },
      {
        question: "Quel format permet de se former même sans connexion internet ?",
        options: ["Le format ePoc / PDF hors-ligne", "La visioconférence", "Le forum en ligne", "La messagerie instantanée"],
        correct: 0,
      },
    ],
  };
}

function buildContent(type: LessonType, parcours: Parcours, moduleTitle: string): LessonContent {
  if (type === "video") return videoContent(parcours, moduleTitle);
  if (type === "quiz") return quizContent(parcours);
  return texteContent(parcours, moduleTitle);
}

function buildResources(type: LessonType): Resource[] {
  const base: Resource[] = [
    { title: "Fiche de synthèse", type: "PDF", size: "320 Ko" },
    { title: "Exemple de séquence", type: "PDF", size: "540 Ko" },
  ];
  if (type === "video") base.push({ title: "Diaporama de la vidéo", type: "PDF", size: "1,2 Mo" });
  return base;
}

const curriculumCache = new Map<string, Curriculum>();

/** Construit (et met en cache) le curriculum d'un parcours à partir de son slug. */
export function getCurriculum(slug: string): Curriculum | null {
  const cached = curriculumCache.get(slug);
  if (cached) return cached;

  const parcours = PARCOURS.find((p) => p.slug === slug);
  if (!parcours) return null;

  const lessonsPerModule = Math.max(3, Math.round(parcours.lessons / parcours.modules));
  const modules: CurriculumModule[] = [];
  const flat: Lesson[] = [];

  for (let m = 0; m < parcours.modules; m++) {
    const moduleTitle = `Module ${m + 1} — ${MODULE_THEMES[m % MODULE_THEMES.length]}`;
    const lessons: Lesson[] = [];

    for (let l = 0; l < lessonsPerModule; l++) {
      // Dernière leçon du module = quiz
      const isLast = l === lessonsPerModule - 1;
      const type: LessonType = isLast ? "quiz" : TYPE_CYCLE[l % TYPE_CYCLE.length];
      const title = isLast ? "Quiz de validation" : LESSON_TITLES[l % (LESSON_TITLES.length - 1)];
      const id = `${slug}__m${m}__l${l}`;
      const durationMin = type === "video" ? 8 + (l % 3) * 2 : type === "quiz" ? 10 : 12 + (l % 2) * 3;

      const lesson: Lesson = {
        id,
        title,
        type,
        durationMin,
        moduleIndex: m,
        moduleTitle,
        objectives: [
          "Comprendre les notions clés de la leçon",
          "Relier la théorie à votre pratique de classe",
          "Préparer la mise en œuvre avec vos élèves",
        ],
        content: buildContent(type, parcours, moduleTitle),
        resources: buildResources(type),
      };
      lessons.push(lesson);
      flat.push(lesson);
    }

    modules.push({ index: m, title: moduleTitle, lessons });
  }

  const curriculum: Curriculum = {
    slug,
    title: parcours.title,
    modules,
    flat,
    totalLessons: flat.length,
  };
  curriculumCache.set(slug, curriculum);
  return curriculum;
}

/** Retourne la leçon précédente et suivante dans l'ordre du parcours. */
export function getAdjacentLessons(slug: string, lessonId: string) {
  const curriculum = getCurriculum(slug);
  if (!curriculum) return { prev: null, next: null, lesson: null, curriculum: null };
  const idx = curriculum.flat.findIndex((l) => l.id === lessonId);
  return {
    curriculum,
    lesson: idx >= 0 ? curriculum.flat[idx] : null,
    prev: idx > 0 ? curriculum.flat[idx - 1] : null,
    next: idx >= 0 && idx < curriculum.flat.length - 1 ? curriculum.flat[idx + 1] : null,
  };
}
