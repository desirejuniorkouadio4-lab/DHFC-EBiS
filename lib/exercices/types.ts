/**
 * Moteur d'exercices DHFC-EBiS (§13) — types v1.
 * 8 types auto-corrigeables. Le contenu est stocké dans `Lesson.content`
 * (leçon de type QUIZ) sous la forme { kind:"quiz", intro, passScore, exercices }.
 */

export const EXERCICE_TYPES = [
  "QCU",
  "QCM",
  "VRAI_FAUX",
  "REPONSE_COURTE",
  "TEXTE_A_TROUS",
  "ORDONNANCEMENT",
  "APPARIEMENT",
  "CALCUL",
] as const;

export type ExerciceType = (typeof EXERCICE_TYPES)[number];

export type Option = { id: string; text: string };
export type OrderItem = { id: string; text: string };
export type Blank = { id: number; type: "text" | "select"; options?: string[] };

type Base = { id: string; prompt: string; points: number; feedback?: string };

export type Exercice =
  | (Base & { type: "QCU"; data: { options: Option[]; shuffle: boolean }; correctAnswer: string })
  | (Base & { type: "QCM"; data: { options: Option[]; shuffle: boolean; scoring: "all" | "partial" }; correctAnswer: string[] })
  | (Base & { type: "VRAI_FAUX"; data: Record<string, never>; correctAnswer: boolean })
  | (Base & { type: "REPONSE_COURTE"; data: { caseSensitive: boolean; accentSensitive: boolean }; correctAnswer: string[] })
  | (Base & {
      type: "TEXTE_A_TROUS";
      data: { text: string; blanks: Blank[]; caseSensitive: boolean; accentSensitive: boolean };
      correctAnswer: Record<string, string[]>;
    })
  | (Base & { type: "ORDONNANCEMENT"; data: { items: OrderItem[] }; correctAnswer: string[] })
  | (Base & { type: "APPARIEMENT"; data: { leftItems: Option[]; rightItems: Option[] }; correctAnswer: Record<string, string> })
  | (Base & { type: "CALCUL"; data: { tolerance: number; unit: string | null }; correctAnswer: number });

export type QuizContent = {
  kind: "quiz";
  intro: string;
  passScore: number; // seuil de réussite (%)
  exercices: Exercice[];
};

/** Réponse d'un apprenant pour un exercice donné (forme dépend du type). */
export type AnswerByType = {
  QCU: string;
  QCM: string[];
  VRAI_FAUX: boolean | null;
  REPONSE_COURTE: string;
  TEXTE_A_TROUS: Record<string, string>;
  ORDONNANCEMENT: string[];
  APPARIEMENT: Record<string, string>;
  CALCUL: string;
};

export const TYPE_LABEL: Record<ExerciceType, string> = {
  QCU: "Choix unique",
  QCM: "Choix multiples",
  VRAI_FAUX: "Vrai / Faux",
  REPONSE_COURTE: "Réponse courte",
  TEXTE_A_TROUS: "Texte à trous",
  ORDONNANCEMENT: "Ordonnancement",
  APPARIEMENT: "Appariement",
  CALCUL: "Calcul",
};

export const TYPE_HINT: Record<ExerciceType, string> = {
  QCU: "Une seule bonne réponse parmi plusieurs.",
  QCM: "Plusieurs bonnes réponses possibles.",
  VRAI_FAUX: "Une affirmation à valider.",
  REPONSE_COURTE: "Texte libre court, corrigé sur une liste de réponses acceptées.",
  TEXTE_A_TROUS: "Compléter les blancs d'un texte.",
  ORDONNANCEMENT: "Remettre des éléments dans le bon ordre.",
  APPARIEMENT: "Relier chaque élément de gauche au bon élément de droite.",
  CALCUL: "Résultat numérique avec tolérance.",
};

let counter = 0;
/** Identifiant court stable (client). */
export function uid(prefix = "e"): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Normalisation d'un texte pour la comparaison (réponse courte / trous). */
export function normalizeText(
  s: string,
  opts: { caseSensitive?: boolean; accentSensitive?: boolean } = {}
): string {
  let t = s.trim().replace(/\s+/g, " ");
  if (!opts.accentSensitive) t = t.normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!opts.caseSensitive) t = t.toLowerCase();
  return t;
}

/** Exercice par défaut selon le type (utilisé par le builder). */
export function createExercice(type: ExerciceType): Exercice {
  const base = { id: uid(), prompt: "", points: 1, feedback: "" };
  switch (type) {
    case "QCU":
      return {
        ...base,
        type,
        data: { shuffle: false, options: [{ id: uid("o"), text: "" }, { id: uid("o"), text: "" }] },
        correctAnswer: "",
      };
    case "QCM":
      return {
        ...base,
        type,
        data: { shuffle: false, scoring: "partial", options: [{ id: uid("o"), text: "" }, { id: uid("o"), text: "" }] },
        correctAnswer: [],
      };
    case "VRAI_FAUX":
      return { ...base, type, data: {}, correctAnswer: true };
    case "REPONSE_COURTE":
      return { ...base, type, data: { caseSensitive: false, accentSensitive: false }, correctAnswer: [] };
    case "TEXTE_A_TROUS":
      return {
        ...base,
        type,
        data: { text: "", blanks: [], caseSensitive: false, accentSensitive: false },
        correctAnswer: {},
      };
    case "ORDONNANCEMENT":
      return {
        ...base,
        type,
        data: { items: [{ id: uid("i"), text: "" }, { id: uid("i"), text: "" }] },
        correctAnswer: [],
      };
    case "APPARIEMENT":
      return {
        ...base,
        type,
        data: { leftItems: [{ id: uid("l"), text: "" }], rightItems: [{ id: uid("r"), text: "" }] },
        correctAnswer: {},
      };
    case "CALCUL":
      return { ...base, type, data: { tolerance: 0, unit: null }, correctAnswer: 0 };
  }
}

/** Réponse vide initiale pour un exercice (player). */
export function emptyAnswer(ex: Exercice): unknown {
  switch (ex.type) {
    case "QCU":
      return "";
    case "QCM":
      return [];
    case "VRAI_FAUX":
      return null;
    case "REPONSE_COURTE":
    case "CALCUL":
      return "";
    case "TEXTE_A_TROUS":
      return {};
    case "ORDONNANCEMENT":
      return seededShuffle(ex.data.items.map((i) => i.id), ex.id);
    case "APPARIEMENT":
      return {};
  }
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mélange déterministe (graine = chaîne) — identique côté serveur et client,
 * donc sans mismatch d'hydratation. Garantit un ordre ≠ original si possible.
 */
export function seededShuffle<T>(arr: T[], seed: string): T[] {
  const rnd = mulberry32(hashStr(seed));
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.length > 1 && a.every((v, i) => v === arr[i])) [a[0], a[1]] = [a[1], a[0]];
  return a;
}
