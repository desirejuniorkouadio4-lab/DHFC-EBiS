import { describe, it, expect } from "vitest";
import {
  defaultCompletion,
  normalizeCompletion,
  normalizeAccess,
} from "@/lib/completion/types";
import {
  evaluateCompletion,
  isAutoComplete,
  evaluateAccess,
  effectiveLock,
  enabledConditions,
  EMPTY_SIGNALS,
  type CompletionSignals,
} from "@/lib/completion/engine";

const sig = (p: Partial<CompletionSignals> = {}): CompletionSignals => ({ ...EMPTY_SIGNALS, ...p });

describe("normalizeCompletion", () => {
  it("défaut = manuel", () => {
    expect(normalizeCompletion(null)).toEqual(defaultCompletion());
    expect(normalizeCompletion(undefined).mode).toBe("manual");
  });
  it("borne passScore et coerce les booléens", () => {
    const r = normalizeCompletion({ mode: "auto", pass: true, passScore: 150, view: "yes" });
    expect(r.passScore).toBe(100);
    expect(r.view).toBe(false); // "yes" n'est pas true strict
    expect(r.pass).toBe(true);
  });
});

describe("evaluateCompletion", () => {
  it("mode none → non suivi", () => {
    expect(evaluateCompletion(normalizeCompletion({ mode: "none" }), sig(), false)).toBe("not-tracked");
  });
  it("mode manuel suit la case cochée", () => {
    const r = normalizeCompletion({ mode: "manual" });
    expect(evaluateCompletion(r, sig(), false)).toBe("incomplete");
    expect(evaluateCompletion(r, sig(), true)).toBe("complete");
  });
  it("auto sans condition retombe sur « vue »", () => {
    const r = normalizeCompletion({ mode: "auto" });
    expect(enabledConditions(r)).toEqual(["view"]);
    expect(evaluateCompletion(r, sig({ viewed: false }), false)).toBe("incomplete");
    expect(evaluateCompletion(r, sig({ viewed: true }), false)).toBe("complete");
  });
  it("auto cumule les conditions (ET)", () => {
    const r = normalizeCompletion({ mode: "auto", view: true, submit: true, pass: true, passScore: 60 });
    expect(isAutoComplete(r, sig({ viewed: true, submitted: true, score: 60 }))).toBe(true);
    expect(isAutoComplete(r, sig({ viewed: true, submitted: true, score: 59 }))).toBe(false); // sous le seuil
    expect(isAutoComplete(r, sig({ viewed: true, submitted: false, score: 90 }))).toBe(false); // pas soumis
  });
  it("condition de note (grade) indépendante de la valeur", () => {
    const r = normalizeCompletion({ mode: "auto", grade: true });
    expect(isAutoComplete(r, sig({ graded: true, score: 0 }))).toBe(true);
    expect(isAutoComplete(r, sig({ graded: false }))).toBe(false);
  });
});

describe("evaluateAccess", () => {
  it("aucune contrainte → déverrouillé", () => {
    expect(evaluateAccess(null, new Set()).locked).toBe(false);
    expect(evaluateAccess({ prerequisites: [], requireAll: true }, new Set()).locked).toBe(false);
  });
  it("ET : toutes requises", () => {
    const r = normalizeAccess({ prerequisites: ["a", "b"], requireAll: true });
    expect(evaluateAccess(r, new Set(["a"])).locked).toBe(true);
    expect(evaluateAccess(r, new Set(["a"])).missing).toEqual(["b"]);
    expect(evaluateAccess(r, new Set(["a", "b"])).locked).toBe(false);
  });
  it("OU : au moins une", () => {
    const r = normalizeAccess({ prerequisites: ["a", "b"], requireAll: false });
    expect(evaluateAccess(r, new Set()).locked).toBe(true);
    expect(evaluateAccess(r, new Set(["b"])).locked).toBe(false);
  });
});

describe("effectiveLock (module ET leçon)", () => {
  it("verrouillé si le module est verrouillé même sans prérequis de leçon", () => {
    const mod = { prerequisites: ["intro"], requireAll: true };
    const res = effectiveLock(mod, null, new Set());
    expect(res.locked).toBe(true);
    expect(res.missing).toContain("intro");
  });
  it("union des prérequis manquants module + leçon", () => {
    const res = effectiveLock(
      { prerequisites: ["m1"], requireAll: true },
      { prerequisites: ["l1"], requireAll: true },
      new Set()
    );
    expect(res.locked).toBe(true);
    expect(res.missing.sort()).toEqual(["l1", "m1"]);
  });
  it("déverrouillé quand tout est achevé", () => {
    const res = effectiveLock(
      { prerequisites: ["m1"], requireAll: true },
      { prerequisites: ["l1"], requireAll: true },
      new Set(["m1", "l1"])
    );
    expect(res.locked).toBe(false);
  });
});
