/**
 * Données de démonstration de la vitrine DHFC-EBiS.
 * Dans la version cible, ces données proviendront de la base PostgreSQL via Prisma.
 */

import type { LucideIcon } from "lucide-react";
import {
  Sigma,
  MonitorSmartphone,
  Atom,
  Leaf,
  GraduationCap,
  Users,
  Building2,
  UserCheck,
  BookOpen,
  Layers,
} from "lucide-react";

/* ----------------------------------------------------------------
 *  Chiffres clés (§9.3 — section "Chiffres clés")
 * ---------------------------------------------------------------- */
export type Stat = {
  value: number;
  suffix?: string;
  label: string;
  icon: LucideIcon;
};

export const STATS: Stat[] = [
  { value: 1813, label: "Enseignants formés", icon: Users },
  { value: 613, label: "Collèges de proximité", icon: Building2 },
  { value: 170, label: "Tuteurs actifs", icon: UserCheck },
  { value: 314, label: "Encadrants", icon: GraduationCap },
  { value: 27, label: "Modules de formation", icon: BookOpen },
  { value: 4, label: "Disciplines scientifiques", icon: Layers },
];

/* ----------------------------------------------------------------
 *  Disciplines
 * ---------------------------------------------------------------- */
export type Discipline = {
  slug: string;
  name: string;
  short: string;
  icon: LucideIcon;
  color: string; // couleur d'accent (hex)
  bivalence: string;
};

export const DISCIPLINES: Discipline[] = [
  {
    slug: "mathematiques",
    name: "Mathématiques",
    short: "Maths",
    icon: Sigma,
    color: "#f39200",
    bivalence: "Maths · TICE",
  },
  {
    slug: "tice",
    name: "TICE",
    short: "TICE",
    icon: MonitorSmartphone,
    color: "#2563eb",
    bivalence: "Maths · TICE",
  },
  {
    slug: "physique-chimie",
    name: "Physique-Chimie",
    short: "PC",
    icon: Atom,
    color: "#009640",
    bivalence: "PC · SVT",
  },
  {
    slug: "svt",
    name: "Sciences de la Vie et de la Terre",
    short: "SVT",
    icon: Leaf,
    color: "#1faa5a",
    bivalence: "PC · SVT",
  },
];

/* ----------------------------------------------------------------
 *  Parcours (catalogue public)
 * ---------------------------------------------------------------- */
export type Parcours = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  disciplineSlug: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  durationHours: number;
  modules: number;
  lessons: number;
  rating: number;
  reviews: number;
  enrolled: number;
  isNew?: boolean;
  coverUrl?: string | null;
  objectives: string[];
  prerequisites: string[];
  tags: string[];
};

export const PARCOURS: Parcours[] = [
  {
    slug: "raisonnement-mathematique",
    title: "Renforcement Math : Raisonnement Mathématique",
    subtitle: "Logique, démonstration et résolution de problèmes",
    description:
      "Consolidez les fondements du raisonnement déductif et inductif pour transmettre la rigueur mathématique à vos élèves de collège.",
    disciplineSlug: "mathematiques",
    level: "Intermédiaire",
    durationHours: 24,
    modules: 6,
    lessons: 32,
    rating: 4.8,
    reviews: 214,
    enrolled: 642,
    isNew: true,
    objectives: [
      "Maîtriser la logique propositionnelle et les connecteurs logiques",
      "Construire des démonstrations rigoureuses adaptées au collège",
      "Concevoir des situations-problèmes motivantes",
    ],
    prerequisites: ["Niveau licence ou équivalent en mathématiques"],
    tags: ["Logique", "Démonstration", "Pédagogie active"],
  },
  {
    slug: "integrer-le-numerique-en-classe",
    title: "Intégrer le numérique éducatif en classe",
    subtitle: "Outils TICE pour des séquences interactives",
    description:
      "Découvrez comment intégrer des ressources numériques (GeoGebra, simulations, ENT) pour dynamiser vos cours de sciences.",
    disciplineSlug: "tice",
    level: "Débutant",
    durationHours: 18,
    modules: 5,
    lessons: 26,
    rating: 4.7,
    reviews: 188,
    enrolled: 531,
    isNew: true,
    objectives: [
      "Choisir les bons outils numériques selon l'objectif pédagogique",
      "Concevoir une séquence hybride présentiel / distanciel",
      "Évaluer avec des quiz interactifs",
    ],
    prerequisites: ["Aucun prérequis technique particulier"],
    tags: ["GeoGebra", "ENT", "Classe inversée"],
  },
  {
    slug: "experimentation-physique-chimie",
    title: "L'expérimentation en Physique-Chimie",
    subtitle: "Démarche d'investigation et sécurité au laboratoire",
    description:
      "Renforcez votre pratique de la démarche expérimentale, de la formulation d'hypothèses à l'analyse des résultats.",
    disciplineSlug: "physique-chimie",
    level: "Intermédiaire",
    durationHours: 22,
    modules: 6,
    lessons: 30,
    rating: 4.9,
    reviews: 167,
    enrolled: 489,
    objectives: [
      "Structurer une démarche d'investigation scientifique",
      "Maîtriser les protocoles de sécurité au laboratoire",
      "Exploiter des mesures et calculer des incertitudes",
    ],
    prerequisites: ["Bases en physique et chimie générale"],
    tags: ["Démarche d'investigation", "Sécurité", "Mesures"],
  },
  {
    slug: "vivant-environnement-svt",
    title: "Le vivant et son environnement (SVT)",
    subtitle: "Écosystèmes, génétique et éducation au développement durable",
    description:
      "Actualisez vos connaissances en biologie et géologie et apprenez à enseigner le développement durable de manière concrète.",
    disciplineSlug: "svt",
    level: "Débutant",
    durationHours: 20,
    modules: 5,
    lessons: 28,
    rating: 4.6,
    reviews: 142,
    enrolled: 408,
    objectives: [
      "Comprendre les dynamiques des écosystèmes ivoiriens",
      "Aborder la génétique au collège avec des supports adaptés",
      "Construire des projets d'éducation à l'environnement",
    ],
    prerequisites: ["Bases en sciences de la vie et de la Terre"],
    tags: ["Écosystèmes", "Génétique", "EDD"],
  },
  {
    slug: "evaluer-par-competences",
    title: "Évaluer par compétences au collège",
    subtitle: "Approche par compétences et évaluation formative",
    description:
      "Repensez l'évaluation pour la mettre au service des apprentissages, dans une logique d'approche par compétences (APC).",
    disciplineSlug: "mathematiques",
    level: "Avancé",
    durationHours: 16,
    modules: 4,
    lessons: 22,
    rating: 4.8,
    reviews: 96,
    enrolled: 312,
    objectives: [
      "Distinguer évaluation formative et sommative",
      "Construire des grilles critériées",
      "Donner un feedback qui fait progresser",
    ],
    prerequisites: ["Une première expérience d'enseignement"],
    tags: ["APC", "Évaluation", "Feedback"],
  },
  {
    slug: "gestion-classe-heterogene",
    title: "Gérer une classe hétérogène",
    subtitle: "Différenciation pédagogique et climat de classe",
    description:
      "Des stratégies concrètes pour différencier votre enseignement et instaurer un climat de classe propice aux apprentissages.",
    disciplineSlug: "tice",
    level: "Intermédiaire",
    durationHours: 14,
    modules: 4,
    lessons: 20,
    rating: 4.7,
    reviews: 124,
    enrolled: 376,
    objectives: [
      "Mettre en place une différenciation réaliste",
      "Gérer les classes à effectifs élevés",
      "Instaurer un climat de classe serein",
    ],
    prerequisites: ["Aucun"],
    tags: ["Différenciation", "Climat de classe", "Effectifs"],
  },
];

/* ----------------------------------------------------------------
 *  Les 3 formats hybrides (§9.3 — "3 formats")
 * ---------------------------------------------------------------- */
export type FormatHybride = {
  title: string;
  description: string;
  icon: string; // identifiant lucide
};

/* ----------------------------------------------------------------
 *  Étapes du parcours apprenant
 * ---------------------------------------------------------------- */
export const ETAPES = [
  {
    step: "01",
    title: "Connexion",
    description:
      "Activez votre compte avec le lien reçu par e-mail et complétez votre profil (discipline, DREN, collège).",
  },
  {
    step: "02",
    title: "Modules",
    description:
      "Suivez vos parcours à votre rythme : vidéos, ressources, exercices interactifs et quiz auto-corrigés.",
  },
  {
    step: "03",
    title: "Tutorat",
    description:
      "Échangez avec votre tuteur attitré et la communauté via les forums disciplinaires et la messagerie.",
  },
  {
    step: "04",
    title: "Attestation",
    description:
      "Validez votre parcours et recevez automatiquement votre certificat officiel signé DPFC.",
  },
];

/* ----------------------------------------------------------------
 *  Missions (§9.3 — "Notre mission")
 * ---------------------------------------------------------------- */
export const MISSIONS = [
  {
    title: "Former",
    description:
      "Outiller les enseignants bivalents de sciences avec des parcours de formation continue de qualité, ancrés dans les réalités du terrain ivoirien.",
    icon: "GraduationCap",
  },
  {
    title: "Renforcer",
    description:
      "Consolider les compétences disciplinaires et pédagogiques pour améliorer durablement la qualité des apprentissages au collège.",
    icon: "TrendingUp",
  },
  {
    title: "Transformer",
    description:
      "Faire évoluer les pratiques de classe grâce à un dispositif hybride innovant, accessible partout, même hors connexion.",
    icon: "Sparkles",
  },
];

/* ----------------------------------------------------------------
 *  Partenaires (§9.3 — "Partenaires")
 * ---------------------------------------------------------------- */
export type Partenaire = {
  acronym: string;
  name: string;
  role: string;
  logoUrl?: string | null;
};

/** Logos partenaires (public/), par acronyme. Sinon repli sur l'acronyme. */
export const PARTENAIRE_LOGOS: Record<string, string> = {
  MENAET: "/logo-menaet.jpg",
  AUF: "/logo-auf.png",
  AFD: "/logo-afd.png",
};

export const PARTENAIRES: Partenaire[] = [
  { acronym: "MENAET", name: "Ministère de l'Éducation Nationale, de l'Alphabétisation et de l'Enseignement Technique", role: "Tutelle institutionnelle" },
  { acronym: "DPFC", name: "Direction de la Pédagogie et de la Formation Continue", role: "Porteur du dispositif" },
  { acronym: "IGENAET", name: "Inspection Générale de l'Éducation Nationale", role: "Supervision pédagogique" },
  { acronym: "DTSI", name: "Direction des Technologies et des Systèmes d'Information", role: "Partenaire technique" },
  { acronym: "AUF", name: "Agence Universitaire de la Francophonie", role: "Partenaire international" },
  { acronym: "AFD", name: "Agence Française de Développement", role: "Bailleur de fonds" },
];

/* ----------------------------------------------------------------
 *  Témoignages (§9.3 — "Témoignages")
 * ---------------------------------------------------------------- */
export type Temoignage = {
  name: string;
  role: string;
  college: string;
  quote: string;
  initials: string;
};

export const TEMOIGNAGES: Temoignage[] = [
  {
    name: "Aïcha Kouamé",
    role: "Enseignante Maths-TICE",
    college: "Collège Moderne de Bouaké",
    initials: "AK",
    quote:
      "Le dispositif hybride m'a permis de me former sans quitter ma classe. Les modules hors-ligne ont tout changé pour moi qui enseigne dans une zone à faible connexion.",
  },
  {
    name: "Konan Yao",
    role: "Enseignant PC-SVT",
    college: "Collège de Daloa",
    initials: "KY",
    quote:
      "Les exercices interactifs et le suivi de mon tuteur m'ont vraiment fait progresser sur la démarche expérimentale. J'ai repensé toutes mes séquences de chimie.",
  },
  {
    name: "Fatou Diabaté",
    role: "Tutrice Mathématiques",
    college: "DREN d'Abidjan 2",
    initials: "FD",
    quote:
      "En tant que tutrice, j'ai enfin une vue claire de l'avancement de ma cohorte. Je repère les enseignants en difficulté et je peux les accompagner au bon moment.",
  },
  {
    name: "Brou Kouassi",
    role: "Enseignant Maths-TICE",
    college: "Collège de Korhogo",
    initials: "BK",
    quote:
      "La plateforme est rapide même avec ma connexion limitée. J'ai obtenu mon premier certificat et je me suis inscrit à un deuxième parcours dans la foulée.",
  },
];

/* ----------------------------------------------------------------
 *  Actualités (§9.3 — "Actualités")
 * ---------------------------------------------------------------- */
export type Actualite = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: number;
};

export const ACTUALITES: Actualite[] = [
  {
    slug: "lancement-cohorte-2026",
    title: "Lancement de la cohorte nationale 2026",
    excerpt:
      "La DPFC ouvre une nouvelle session de formation continue pour 2 000 enseignants bivalents de sciences à travers les 16 DREN du pays.",
    category: "Institutionnel",
    date: "2026-06-10",
    readingTime: 4,
  },
  {
    slug: "modules-hors-ligne-epoc",
    title: "Les modules ePoc désormais disponibles hors-ligne",
    excerpt:
      "Tous les parcours peuvent maintenant être téléchargés et suivis sans connexion grâce au format ouvert ePoc de l'INRIA.",
    category: "Produit",
    date: "2026-05-28",
    readingTime: 3,
  },
  {
    slug: "partenariat-auf-afd",
    title: "Un partenariat renforcé avec l'AUF et l'AFD",
    excerpt:
      "Le soutien des partenaires internationaux permet d'étendre le dispositif et d'enrichir le catalogue de nouveaux parcours.",
    category: "Partenariat",
    date: "2026-05-15",
    readingTime: 5,
  },
];

/* ----------------------------------------------------------------
 *  FAQ (§9.2 — page /faq)
 * ---------------------------------------------------------------- */
export type FaqItem = { question: string; answer: string };
export type FaqCategory = { category: string; items: FaqItem[] };

export const FAQ: FaqCategory[] = [
  {
    category: "Accès & inscription",
    items: [
      {
        question: "Comment puis-je accéder à la plateforme ?",
        answer:
          "L'inscription n'est pas ouverte au public. Les enseignants sélectionnés par la DPFC reçoivent un e-mail contenant un lien d'activation. Il suffit de cliquer dessus, de choisir un mot de passe et de compléter son profil.",
      },
      {
        question: "Je n'ai pas reçu mon e-mail d'activation, que faire ?",
        answer:
          "Vérifiez d'abord votre dossier de courriers indésirables. Si vous ne trouvez rien, contactez le support à support@dhfc.dpfc.ci en précisant votre matricule MENAET.",
      },
      {
        question: "Qui peut s'inscrire au dispositif DHFC-EBiS ?",
        answer:
          "Le dispositif s'adresse aux enseignants bivalents de sciences (Maths-TICE et Physique-Chimie/SVT) du secondaire, désignés par leur DREN dans le cadre des cohortes de formation continue.",
      },
    ],
  },
  {
    category: "Formation & parcours",
    items: [
      {
        question: "Combien de temps dure un parcours ?",
        answer:
          "La durée varie de 14 à 24 heures selon le parcours, à suivre à votre rythme sur la durée de la cohorte. Chaque parcours indique sa durée estimée et son nombre de modules.",
      },
      {
        question: "Puis-je suivre les cours sans connexion internet ?",
        answer:
          "Oui. Chaque module peut être téléchargé pour une consultation hors-ligne (format ePoc et PDF). Votre progression se synchronise automatiquement dès votre retour en ligne.",
      },
      {
        question: "Que se passe-t-il une fois mon parcours terminé ?",
        answer:
          "À la validation de votre parcours (progression complète et quiz final réussi), un certificat officiel signé par la DPFC est généré automatiquement et envoyé par e-mail.",
      },
    ],
  },
  {
    category: "Accompagnement",
    items: [
      {
        question: "Comment contacter mon tuteur ?",
        answer:
          "Chaque cohorte dispose d'un tuteur attitré, joignable via la messagerie intégrée et les forums disciplinaires de votre tableau de bord apprenant.",
      },
      {
        question: "La plateforme est-elle accessible aux personnes en situation de handicap ?",
        answer:
          "Oui, DHFC-EBiS vise la conformité au RGAA 4.1 et aux WCAG 2.2 niveau AA : navigation clavier, lecteurs d'écran, contrastes validés et contenus multi-formats.",
      },
    ],
  },
];

/* ----------------------------------------------------------------
 *  Liens de navigation
 * ---------------------------------------------------------------- */
export const NAV_LINKS = [
  { href: "/mission", label: "Mission" },
  { href: "/parcours", label: "Parcours" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/ressources", label: "Ressources" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];
