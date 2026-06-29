import { describe, it, expect } from "vitest";
import { gradeExercice, gradeQuiz } from "@/lib/exercices/grade";
import type { Exercice } from "@/lib/exercices/types";

const base = { id: "x", prompt: "", points: 1, feedback: "" };

describe("gradeExercice", () => {
  it("QCU : binaire", () => {
    const ex: Exercice = { ...base, type: "QCU", data: { shuffle: false, options: [{ id: "a", text: "A" }, { id: "b", text: "B" }] }, correctAnswer: "b" };
    expect(gradeExercice(ex, "b").score).toBe(1);
    expect(gradeExercice(ex, "a").score).toBe(0);
    expect(gradeExercice(ex, "").score).toBe(0);
  });

  it("QCM partiel : +1/N par bonne, -1/N par mauvaise, borné à 0", () => {
    const ex: Exercice = { ...base, type: "QCM", data: { shuffle: false, scoring: "partial", options: [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }, { id: "d", text: "" }] }, correctAnswer: ["a", "c"] };
    expect(gradeExercice(ex, ["a", "c"]).score).toBe(1);
    expect(gradeExercice(ex, ["a"]).score).toBeCloseTo(0.5);
    expect(gradeExercice(ex, ["a", "b"]).score).toBe(0); // 0.5 - 0.5
    expect(gradeExercice(ex, ["b", "d"]).score).toBe(0); // borné
  });

  it("QCM tout-ou-rien", () => {
    const ex: Exercice = { ...base, type: "QCM", data: { shuffle: false, scoring: "all", options: [{ id: "a", text: "" }, { id: "b", text: "" }] }, correctAnswer: ["a", "b"] };
    expect(gradeExercice(ex, ["a", "b"]).score).toBe(1);
    expect(gradeExercice(ex, ["a"]).score).toBe(0);
  });

  it("VRAI_FAUX", () => {
    const ex: Exercice = { ...base, type: "VRAI_FAUX", data: {}, correctAnswer: true };
    expect(gradeExercice(ex, true).score).toBe(1);
    expect(gradeExercice(ex, false).score).toBe(0);
    expect(gradeExercice(ex, null).score).toBe(0);
  });

  it("REPONSE_COURTE : normalisée casse/accents", () => {
    const ex: Exercice = { ...base, type: "REPONSE_COURTE", data: { caseSensitive: false, accentSensitive: false }, correctAnswer: ["photosynthèse", "la photosynthèse"] };
    expect(gradeExercice(ex, "PHOTOSYNTHESE").score).toBe(1);
    expect(gradeExercice(ex, "  la Photosynthèse ").score).toBe(1);
    expect(gradeExercice(ex, "respiration").score).toBe(0);
  });

  it("TEXTE_A_TROUS : par trou", () => {
    const ex: Exercice = { ...base, type: "TEXTE_A_TROUS", data: { text: "{{0}} {{1}}", blanks: [{ id: 0, type: "text" }, { id: 1, type: "text" }], caseSensitive: false, accentSensitive: false }, correctAnswer: { "0": ["co2"], "1": ["eau"] } };
    expect(gradeExercice(ex, { "0": "CO2", "1": "eau" }).score).toBe(1);
    expect(gradeExercice(ex, { "0": "CO2", "1": "air" }).score).toBeCloseTo(0.5);
  });

  it("ORDONNANCEMENT : exact et paires", () => {
    const ex: Exercice = { ...base, type: "ORDONNANCEMENT", data: { items: [{ id: "x", text: "" }, { id: "y", text: "" }, { id: "z", text: "" }] }, correctAnswer: ["x", "y", "z"] };
    expect(gradeExercice(ex, ["x", "y", "z"]).correct).toBe(true);
    expect(gradeExercice(ex, ["z", "y", "x"]).score).toBe(0);
    expect(gradeExercice(ex, ["y", "x", "z"]).score).toBeCloseTo(0.5);
  });

  it("APPARIEMENT : fraction de paires", () => {
    const ex: Exercice = { ...base, type: "APPARIEMENT", data: { leftItems: [{ id: "l1", text: "" }, { id: "l2", text: "" }], rightItems: [{ id: "r1", text: "" }, { id: "r2", text: "" }] }, correctAnswer: { l1: "r1", l2: "r2" } };
    expect(gradeExercice(ex, { l1: "r1", l2: "r2" }).score).toBe(1);
    expect(gradeExercice(ex, { l1: "r1", l2: "r1" }).score).toBeCloseTo(0.5);
  });

  it("CALCUL : tolérance + virgule décimale", () => {
    const ex: Exercice = { ...base, type: "CALCUL", data: { tolerance: 0.1, unit: null }, correctAnswer: 4 };
    expect(gradeExercice(ex, "4").score).toBe(1);
    expect(gradeExercice(ex, "4,05").score).toBe(1);
    expect(gradeExercice(ex, "5").score).toBe(0);
    expect(gradeExercice(ex, "abc").score).toBe(0);
  });

  it("REPONSE_LONGUE / DEPOT_FICHIER : manuel (0, non corrigé auto)", () => {
    const essay: Exercice = { ...base, type: "REPONSE_LONGUE", data: { minWords: 0, maxWords: 0, rubric: "" } };
    expect(gradeExercice(essay, "un texte").correct).toBe(false);
  });
});

describe("gradeQuiz", () => {
  it("exclut les exercices manuels du score auto", () => {
    const qcu: Exercice = { ...base, id: "1", type: "QCU", data: { shuffle: false, options: [{ id: "a", text: "" }, { id: "b", text: "" }] }, correctAnswer: "b" };
    const essay: Exercice = { ...base, id: "2", type: "REPONSE_LONGUE", data: { minWords: 0, maxWords: 0, rubric: "" } };
    const r = gradeQuiz([qcu, essay], { "1": "b", "2": "blabla" });
    expect(r.total).toBe(1); // seul le QCU compte
    expect(r.percent).toBe(100);
  });

  it("agrège en pourcentage pondéré", () => {
    const qcu: Exercice = { ...base, id: "1", type: "QCU", data: { shuffle: false, options: [{ id: "a", text: "" }, { id: "b", text: "" }] }, correctAnswer: "b" };
    const vf: Exercice = { ...base, id: "2", type: "VRAI_FAUX", data: {}, correctAnswer: true };
    expect(gradeQuiz([qcu, vf], { "1": "b", "2": false }).percent).toBe(50);
  });
});
