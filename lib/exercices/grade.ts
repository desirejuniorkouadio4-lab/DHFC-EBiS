import { isManualType, normalizeText, type Exercice } from "./types";

export type GradeResult = {
  /** Score normalisé entre 0 et 1. */
  score: number;
  /** Vrai si l'exercice est totalement réussi. */
  correct: boolean;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Corrige un exercice (logique pure, réutilisable client et serveur).
 * Pattern stratégie : un cas par type d'exercice.
 */
export function gradeExercice(ex: Exercice, answer: unknown): GradeResult {
  switch (ex.type) {
    case "QCU": {
      const correct = answer === ex.correctAnswer && answer !== "";
      return { score: correct ? 1 : 0, correct };
    }

    case "QCM": {
      const selected = new Set(Array.isArray(answer) ? (answer as string[]) : []);
      const right = new Set(ex.correctAnswer);
      if (ex.data.scoring === "all") {
        const exact =
          selected.size === right.size && [...selected].every((id) => right.has(id));
        return { score: exact ? 1 : 0, correct: exact };
      }
      // Notation partielle : +1/N par bonne réponse, -1/N par mauvaise.
      const n = right.size || 1;
      let raw = 0;
      for (const id of selected) raw += right.has(id) ? 1 / n : -1 / n;
      const score = clamp01(raw);
      return { score, correct: score >= 1 };
    }

    case "VRAI_FAUX": {
      const correct = typeof answer === "boolean" && answer === ex.correctAnswer;
      return { score: correct ? 1 : 0, correct };
    }

    case "REPONSE_COURTE": {
      const a = normalizeText(String(answer ?? ""), ex.data);
      const ok = a !== "" && ex.correctAnswer.some((acc) => normalizeText(acc, ex.data) === a);
      return { score: ok ? 1 : 0, correct: ok };
    }

    case "TEXTE_A_TROUS": {
      const ans = (answer ?? {}) as Record<string, string>;
      const blanks = ex.data.blanks;
      if (blanks.length === 0) return { score: 0, correct: false };
      let good = 0;
      for (const b of blanks) {
        const accepted = ex.correctAnswer[String(b.id)] ?? [];
        const given = normalizeText(String(ans[String(b.id)] ?? ""), ex.data);
        if (given !== "" && accepted.some((acc) => normalizeText(acc, ex.data) === given)) good += 1;
      }
      const score = good / blanks.length;
      return { score, correct: score >= 1 };
    }

    case "ORDONNANCEMENT": {
      const order = Array.isArray(answer) ? (answer as string[]) : [];
      const correctOrder = ex.correctAnswer;
      if (correctOrder.length < 2) return { score: 0, correct: false };
      const pos = new Map(correctOrder.map((id, i) => [id, i]));
      // Paires consécutives dans le bon ordre relatif / total (§13.3).
      let good = 0;
      for (let i = 0; i < order.length - 1; i++) {
        const a = pos.get(order[i]);
        const b = pos.get(order[i + 1]);
        if (a !== undefined && b !== undefined && a < b) good += 1;
      }
      const score = clamp01(good / (correctOrder.length - 1));
      const exact = order.length === correctOrder.length && order.every((id, i) => id === correctOrder[i]);
      return { score, correct: exact };
    }

    case "APPARIEMENT": {
      const ans = (answer ?? {}) as Record<string, string>;
      const pairs = Object.entries(ex.correctAnswer);
      if (pairs.length === 0) return { score: 0, correct: false };
      let good = 0;
      for (const [left, right] of pairs) if (ans[left] === right) good += 1;
      const score = good / pairs.length;
      return { score, correct: score >= 1 };
    }

    case "CALCUL": {
      const raw = String(answer ?? "").replace(",", ".").trim();
      const num = Number(raw);
      if (raw === "" || Number.isNaN(num)) return { score: 0, correct: false };
      const ok = Math.abs(num - ex.correctAnswer) <= (ex.data.tolerance || 0);
      return { score: ok ? 1 : 0, correct: ok };
    }

    case "REPONSE_LONGUE":
      // Correction manuelle par le tuteur : non auto-corrigé.
      return { score: 0, correct: false };
  }
}

/** Agrège les résultats d'un quiz : score pondéré global en %. */
export function gradeQuiz(
  exercices: Exercice[],
  answers: Record<string, unknown>
): { percent: number; results: Record<string, GradeResult>; earned: number; total: number } {
  const results: Record<string, GradeResult> = {};
  let earned = 0;
  let total = 0;
  for (const ex of exercices) {
    // Les exercices à correction manuelle ne comptent pas dans le score auto.
    if (isManualType(ex.type)) continue;
    const r = gradeExercice(ex, answers[ex.id]);
    results[ex.id] = r;
    earned += r.score * (ex.points || 1);
    total += ex.points || 1;
  }
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
  return { percent, results, earned, total };
}
