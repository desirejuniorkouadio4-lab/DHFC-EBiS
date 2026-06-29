import { describe, it, expect } from "vitest";
import { normalizeText, seededShuffle, createExercice } from "@/lib/exercices/types";
import { normalizeQuizContent } from "@/lib/exercices/legacy";

describe("normalizeText", () => {
  it("retire accents et casse par défaut", () => {
    expect(normalizeText("  Éléphant  ")).toBe("elephant");
  });
  it("respecte la sensibilité à la casse/accents", () => {
    expect(normalizeText("Été", { caseSensitive: true, accentSensitive: true })).toBe("Été");
  });
  it("compacte les espaces", () => {
    expect(normalizeText("a   b\tc")).toBe("a b c");
  });
});

describe("seededShuffle", () => {
  it("déterministe : même graine → même ordre", () => {
    const a = seededShuffle([1, 2, 3, 4, 5], "graine");
    const b = seededShuffle([1, 2, 3, 4, 5], "graine");
    expect(a).toEqual(b);
  });
  it("évite l'ordre identique à l'original", () => {
    const arr = [1, 2, 3, 4];
    const s = seededShuffle(arr, "x");
    expect(s).not.toEqual(arr);
    expect([...s].sort()).toEqual([1, 2, 3, 4]);
  });
});

describe("normalizeQuizContent (legacy)", () => {
  it("convertit l'ancien format questions → exercices QCU avec ids déterministes", () => {
    const legacy = {
      kind: "quiz",
      intro: "Validez",
      questions: [{ question: "2+2 ?", options: ["3", "4"], correct: 1 }],
    };
    const q = normalizeQuizContent(legacy);
    expect(q.exercices).toHaveLength(1);
    const ex = q.exercices[0];
    expect(ex.type).toBe("QCU");
    expect(ex.id).toBe("lq0");
    if (ex.type === "QCU") {
      expect(ex.data.options.map((o) => o.id)).toEqual(["lq0o0", "lq0o1"]);
      expect(ex.correctAnswer).toBe("lq0o1");
    }
  });
  it("passe le nouveau format tel quel", () => {
    const ex = createExercice("VRAI_FAUX");
    const q = normalizeQuizContent({ kind: "quiz", intro: "", passScore: 80, exercices: [ex] });
    expect(q.passScore).toBe(80);
    expect(q.exercices[0].id).toBe(ex.id);
  });
  it("contenu vide → quiz vide", () => {
    expect(normalizeQuizContent(null).exercices).toEqual([]);
  });
});
