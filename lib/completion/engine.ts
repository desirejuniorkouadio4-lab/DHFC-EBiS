/**
 * Moteur d'achèvement & d'accès (logique pure, réutilisable client/serveur).
 */

import {
  type CompletionRule,
  type CompletionCondition,
  normalizeAccess,
} from "./types";

/** Signaux observés pour un apprenant sur une activité. */
export type CompletionSignals = {
  viewed: boolean; // l'activité a été ouverte
  submitted: boolean; // un travail a été soumis
  graded: boolean; // une note a été reçue
  score: number | null; // note 0..100 (null si non notée)
};

export type CompletionState = "not-tracked" | "incomplete" | "complete";

export const EMPTY_SIGNALS: CompletionSignals = { viewed: false, submitted: false, graded: false, score: null };

/** Conditions automatiques activées (au moins « view » par défaut en mode auto). */
export function enabledConditions(rule: CompletionRule): CompletionCondition[] {
  const out: CompletionCondition[] = [];
  if (rule.view) out.push("view");
  if (rule.submit) out.push("submit");
  if (rule.grade) out.push("grade");
  if (rule.pass) out.push("pass");
  // Un achèvement automatique sans aucune condition retombe sur « à l'ouverture ».
  return out.length ? out : ["view"];
}

/** Une condition automatique unitaire est-elle satisfaite ? */
function conditionMet(cond: CompletionCondition, rule: CompletionRule, s: CompletionSignals): boolean {
  switch (cond) {
    case "view":
      return s.viewed;
    case "submit":
      return s.submitted;
    case "grade":
      return s.graded;
    case "pass":
      return s.score !== null && s.score >= rule.passScore;
  }
}

/** L'achèvement automatique est-il atteint (toutes les conditions activées) ? */
export function isAutoComplete(rule: CompletionRule, s: CompletionSignals): boolean {
  return enabledConditions(rule).every((c) => conditionMet(c, rule, s));
}

/**
 * État d'achèvement d'une activité.
 * - mode "none"   → non suivi.
 * - mode "manual" → l'apprenant coche (manualDone).
 * - mode "auto"   → calculé à partir des signaux.
 */
export function evaluateCompletion(rule: CompletionRule, s: CompletionSignals, manualDone: boolean): CompletionState {
  if (rule.mode === "none") return "not-tracked";
  if (rule.mode === "manual") return manualDone ? "complete" : "incomplete";
  return isAutoComplete(rule, s) ? "complete" : "incomplete";
}

/** Résultat d'une évaluation de restriction d'accès. */
export type AccessState = { locked: boolean; missing: string[] };

/**
 * Évalue une règle d'accès isolée contre l'ensemble des leçons achevées.
 * `missing` = prérequis non satisfaits (utile pour l'affichage).
 */
export function evaluateAccess(rule: unknown, completed: Set<string>): AccessState {
  const r = normalizeAccess(rule);
  if (r.prerequisites.length === 0) return { locked: false, missing: [] };
  const missing = r.prerequisites.filter((id) => !completed.has(id));
  if (r.requireAll) return { locked: missing.length > 0, missing };
  // OU : déverrouillé dès qu'un prérequis est satisfait.
  const anyMet = r.prerequisites.some((id) => completed.has(id));
  return anyMet ? { locked: false, missing: [] } : { locked: true, missing: r.prerequisites };
}

/**
 * État de verrouillage effectif d'une leçon = restriction du module ET de la leçon.
 * Verrouillée si l'une des deux n'est pas satisfaite ; `missing` = union des prérequis manquants.
 */
export function effectiveLock(
  moduleAccess: unknown,
  lessonAccess: unknown,
  completed: Set<string>
): AccessState {
  const m = evaluateAccess(moduleAccess, completed);
  const l = evaluateAccess(lessonAccess, completed);
  const missing = Array.from(new Set([...m.missing, ...l.missing]));
  return { locked: m.locked || l.locked, missing };
}
