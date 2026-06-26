/**
 * Données de l'espace apprenant (session simulée).
 * Dans la version cible : utilisateur issu d'Auth.js + requêtes Prisma (cf. §10/§15).
 */

import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Target,
  Trophy,
  GraduationCap,
  Sparkles,
  Users,
  Award,
  BookOpenCheck,
} from "lucide-react";
import { PARCOURS } from "@/lib/data";

/* ----------------------------------------------------------------
 *  Utilisateur courant (apprenant)
 * ---------------------------------------------------------------- */
export const CURRENT_USER = {
  firstName: "Konan",
  lastName: "Yao",
  initials: "KY",
  email: "konan.yao@dhfc.dpfc.ci",
  role: "Apprenant",
  bivalence: "PC · SVT",
  region: "Gôh",
  dren: "DREN de Daloa",
  college: "Collège Moderne de Daloa",
  xp: 1240,
  level: 5,
  nextLevelXp: 1500,
  streak: 6,
};

/* ----------------------------------------------------------------
 *  Inscriptions (parcours suivis) — la progression réelle est gérée
 *  par le store local ; `baselineProgress` sert d'amorçage initial.
 * ---------------------------------------------------------------- */
export type Enrollment = {
  slug: string;
  cohort: string;
  tutor: string;
  tutorInitials: string;
  baselineProgress: number; // %
  lastLessonId: string | null;
};

export const ENROLLMENTS: Enrollment[] = [
  {
    slug: "experimentation-physique-chimie",
    cohort: "Cohorte Mars 2026 — PC/SVT",
    tutor: "Fatou Diabaté",
    tutorInitials: "FD",
    baselineProgress: 45,
    lastLessonId: "experimentation-physique-chimie__m2__l1",
  },
  {
    slug: "vivant-environnement-svt",
    cohort: "Cohorte Mars 2026 — PC/SVT",
    tutor: "Fatou Diabaté",
    tutorInitials: "FD",
    baselineProgress: 80,
    lastLessonId: "vivant-environnement-svt__m3__l0",
  },
  {
    slug: "evaluer-par-competences",
    cohort: "Cohorte Mars 2026 — Transversal",
    tutor: "Brou Kouassi",
    tutorInitials: "BK",
    baselineProgress: 15,
    lastLessonId: "evaluer-par-competences__m0__l2",
  },
];

export function getEnrollment(slug: string): Enrollment | undefined {
  return ENROLLMENTS.find((e) => e.slug === slug);
}

export function isEnrolled(slug: string): boolean {
  return ENROLLMENTS.some((e) => e.slug === slug);
}

/** Parcours recommandés = non encore suivis. */
export function getRecommended() {
  return PARCOURS.filter((p) => !isEnrolled(p.slug)).slice(0, 3);
}

/* ----------------------------------------------------------------
 *  Statistiques personnelles (§15.1)
 * ---------------------------------------------------------------- */
export type StatItem = { label: string; value: number; suffix?: string; icon: LucideIcon };

export const USER_STATS: StatItem[] = [
  { label: "Heures de formation", value: 42, suffix: " h", icon: GraduationCap },
  { label: "Quiz réussis", value: 18, icon: Target },
  { label: "Jours d'affilée", value: 6, icon: Flame },
  { label: "Badges obtenus", value: 5, icon: Trophy },
];

/* ----------------------------------------------------------------
 *  Badges (§18.2)
 * ---------------------------------------------------------------- */
export type Badge = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: "commun" | "rare" | "épique" | "légendaire";
  earned: boolean;
};

export const BADGES: Badge[] = [
  { slug: "premier-pas", name: "Premier pas", description: "Terminer sa 1ʳᵉ leçon", icon: Sparkles, rarity: "commun", earned: true },
  { slug: "streak-7", name: "Assidu", description: "Se connecter 6 jours d'affilée", icon: Flame, rarity: "rare", earned: true },
  { slug: "quiz-parfait", name: "Sans faute", description: "100 % à un quiz", icon: Target, rarity: "rare", earned: true },
  { slug: "entraide", name: "Entraide", description: "10 réponses utiles au forum", icon: Users, rarity: "épique", earned: true },
  { slug: "diplome", name: "Diplômé", description: "Obtenir un 1ᵉʳ certificat", icon: Award, rarity: "épique", earned: true },
  { slug: "polyglotte", name: "Polyvalent", description: "Finir un parcours dans 2 disciplines", icon: BookOpenCheck, rarity: "légendaire", earned: false },
];

/* ----------------------------------------------------------------
 *  Activité récente (§15.1)
 * ---------------------------------------------------------------- */
export type Activity = { type: "quiz" | "lesson" | "badge" | "message"; label: string; time: string };

export const ACTIVITY: Activity[] = [
  { type: "quiz", label: "Quiz « Démarche d'investigation » réussi (90 %)", time: "Il y a 2 h" },
  { type: "lesson", label: "Leçon « Sécurité au laboratoire » terminée", time: "Hier" },
  { type: "badge", label: "Badge « Sans faute » obtenu", time: "Il y a 2 jours" },
  { type: "message", label: "Nouveau message de votre tutrice Fatou Diabaté", time: "Il y a 3 jours" },
  { type: "lesson", label: "Leçon « Les écosystèmes ivoiriens » terminée", time: "Il y a 4 jours" },
];

/* ----------------------------------------------------------------
 *  Planning / échéances (§15.1)
 * ---------------------------------------------------------------- */
export type PlanningItem = {
  title: string;
  kind: "devoir" | "live" | "quiz";
  date: string;
  due: string;
};

export const PLANNING: PlanningItem[] = [
  { title: "Devoir — Analyse d'une expérience", kind: "devoir", date: "2026-06-29", due: "Dans 3 jours" },
  { title: "Session live — Échanges avec la tutrice", kind: "live", date: "2026-07-01", due: "Dans 5 jours" },
  { title: "Quiz final — Le vivant et son environnement", kind: "quiz", date: "2026-07-04", due: "Dans 8 jours" },
];
