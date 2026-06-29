/**
 * Achèvement d'activité & restrictions d'accès (inspiré de Moodle, §13.x).
 * Types + normaliseurs purs, partagés client/serveur.
 *
 * Stockés en JSON sur `Lesson.completion` / `Lesson.access` / `Module.access`.
 */

export type CompletionMode = "none" | "manual" | "auto";

/** Règle d'achèvement d'une activité (configurée par le concepteur). */
export type CompletionRule = {
  mode: CompletionMode;
  /** Conditions automatiques cumulables (ET) — ignorées si mode ≠ "auto". */
  view: boolean; // validé dès l'ouverture
  submit: boolean; // doit soumettre un travail
  grade: boolean; // doit recevoir une note (quelle qu'elle soit)
  pass: boolean; // doit obtenir une note ≥ passScore
  passScore: number; // 0..100
};

/** Règle de restriction d'accès (déverrouillage conditionnel). */
export type AccessRule = {
  /** Identifiants des leçons devant être à l'état « achevé ». */
  prerequisites: string[];
  /** true = toutes requises (ET, défaut) ; false = au moins une (OU). */
  requireAll: boolean;
};

export const COMPLETION_CONDITIONS = ["view", "submit", "grade", "pass"] as const;
export type CompletionCondition = (typeof COMPLETION_CONDITIONS)[number];

export const CONDITION_LABEL: Record<CompletionCondition, string> = {
  view: "Avoir ouvert l'activité",
  submit: "Avoir soumis un travail",
  grade: "Avoir reçu une note",
  pass: "Avoir obtenu la note de passage",
};

/** Règle d'achèvement par défaut : manuel (préserve le comportement historique). */
export function defaultCompletion(): CompletionRule {
  return { mode: "manual", view: false, submit: false, grade: false, pass: false, passScore: 50 };
}

/** Normalise une valeur JSON arbitraire vers une `CompletionRule` sûre. */
export function normalizeCompletion(raw: unknown): CompletionRule {
  const d = defaultCompletion();
  if (!raw || typeof raw !== "object") return d;
  const c = raw as Record<string, unknown>;
  const mode: CompletionMode = c.mode === "none" || c.mode === "auto" || c.mode === "manual" ? c.mode : "manual";
  const passScore = typeof c.passScore === "number" ? Math.min(100, Math.max(0, c.passScore)) : 50;
  return {
    mode,
    view: c.view === true,
    submit: c.submit === true,
    grade: c.grade === true,
    pass: c.pass === true,
    passScore,
  };
}

/** Normalise une valeur JSON arbitraire vers une `AccessRule` sûre. */
export function normalizeAccess(raw: unknown): AccessRule {
  if (!raw || typeof raw !== "object") return { prerequisites: [], requireAll: true };
  const a = raw as Record<string, unknown>;
  const prerequisites = Array.isArray(a.prerequisites)
    ? a.prerequisites.filter((x): x is string => typeof x === "string")
    : [];
  return { prerequisites, requireAll: a.requireAll !== false };
}

/** Une règle de complétion a-t-elle un effet (suivi actif) ? */
export function isTracked(rule: CompletionRule): boolean {
  return rule.mode !== "none";
}

/** Une règle d'accès impose-t-elle une restriction ? */
export function hasRestriction(rule: AccessRule): boolean {
  return rule.prerequisites.length > 0;
}
