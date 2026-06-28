import { type Exercice, type QuizContent } from "./types";

/**
 * Normalise le contenu d'une leçon QUIZ vers le format `QuizContent` (exercices).
 * - Nouveau format ({ exercices }) : passe tel quel.
 * - Ancien format ({ questions:[{question, options, correct}] }) : converti en QCU.
 * À appeler UNE fois (initialiseur de state) pour garder les `id` stables.
 */
export function normalizeQuizContent(content: unknown): QuizContent {
  const c = (content && typeof content === "object" ? content : {}) as Record<string, unknown>;
  const intro = typeof c.intro === "string" ? c.intro : "";
  const passScore = typeof c.passScore === "number" ? c.passScore : 60;

  if (Array.isArray(c.exercices)) {
    return { kind: "quiz", intro, passScore, exercices: c.exercices as Exercice[] };
  }

  if (Array.isArray(c.questions)) {
    // Ids déterministes (basés sur l'index) pour éviter tout mismatch d'hydratation.
    const exercices: Exercice[] = (c.questions as Record<string, unknown>[]).map((q, qi) => {
      const options = (Array.isArray(q.options) ? (q.options as unknown[]) : []).map((t, oi) => ({
        id: `lq${qi}o${oi}`,
        text: String(t ?? ""),
      }));
      const correctIdx = typeof q.correct === "number" ? q.correct : 0;
      return {
        id: `lq${qi}`,
        type: "QCU",
        prompt: String(q.question ?? ""),
        points: 1,
        feedback: "",
        data: { shuffle: false, options },
        correctAnswer: options[correctIdx]?.id ?? "",
      };
    });
    return { kind: "quiz", intro, passScore, exercices };
  }

  return { kind: "quiz", intro, passScore, exercices: [] };
}
