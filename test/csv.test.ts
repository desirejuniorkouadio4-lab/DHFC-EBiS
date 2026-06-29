import { describe, it, expect } from "vitest";
import { parseCsv, csvCell, toCsv } from "@/lib/admin/csv";

describe("parseCsv", () => {
  it("parse un CSV simple", () => {
    const rows = parseCsv("a,b,c\n1,2,3");
    expect(rows).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
  });
  it("gère les guillemets, virgules et guillemets échappés", () => {
    const rows = parseCsv('name,note\n"Diabaté, Fatou","dit ""bonjour"""');
    expect(rows[1]).toEqual(["Diabaté, Fatou", 'dit "bonjour"']);
  });
  it("gère les retours à la ligne dans un champ entre guillemets", () => {
    const rows = parseCsv('a,b\n"ligne1\nligne2",x');
    expect(rows[1]).toEqual(["ligne1\nligne2", "x"]);
  });
  it("ignore les lignes vides", () => {
    const rows = parseCsv("a,b\n\n1,2\n");
    expect(rows).toEqual([["a", "b"], ["1", "2"]]);
  });
});

describe("csvCell / toCsv", () => {
  it("échappe les cellules contenant virgule/guillemet/retour ligne", () => {
    expect(csvCell("simple")).toBe("simple");
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('a"b')).toBe('"a""b"');
  });
  it("construit un CSV", () => {
    expect(toCsv(["x", "y"], [[1, "a,b"]])).toBe('x,y\n1,"a,b"');
  });
  it("aller-retour parse(toCsv())", () => {
    const header = ["nom", "ville"];
    const rows = [["Konan", "Daloa, Gôh"], ['Aya "K"', "Bouaké"]];
    const parsed = parseCsv(toCsv(header, rows));
    expect(parsed).toEqual([header, ...rows]);
  });
});
