import { describe, it, expect } from "vitest";
import { can, roleHomePath, roleLabel } from "@/lib/rbac";

describe("can()", () => {
  it("SUPERADMIN a toutes les permissions", () => {
    expect(can("SUPERADMIN", "users.manage")).toBe(true);
    expect(can("SUPERADMIN", "n_importe_quoi")).toBe(true);
  });
  it("ADMIN gère utilisateurs et cohortes mais pas une action inconnue", () => {
    expect(can("ADMIN", "users.manage")).toBe(true);
    expect(can("ADMIN", "cohorts.manage")).toBe(true);
    expect(can("ADMIN", "courses.learn")).toBe(false);
  });
  it("APPRENANT ne peut pas gérer les utilisateurs", () => {
    expect(can("APPRENANT", "users.manage")).toBe(false);
    expect(can("APPRENANT", "courses.learn")).toBe(true);
  });
  it("rôle vide / inconnu : aucune permission", () => {
    expect(can(null, "users.manage")).toBe(false);
    expect(can("INCONNU", "users.manage")).toBe(false);
  });
});

describe("roleHomePath / roleLabel", () => {
  it("redirige chaque rôle vers son espace", () => {
    expect(roleHomePath("APPRENANT")).toBe("/tableau-de-bord");
    expect(roleHomePath("TUTEUR")).toBe("/tuteur");
    expect(roleHomePath("ADMIN")).toBe("/admin");
    expect(roleHomePath("SUPERADMIN")).toBe("/admin");
    expect(roleHomePath(null)).toBe("/tableau-de-bord");
  });
  it("libellés", () => {
    expect(roleLabel("TUTEUR")).toBe("Tuteur");
    expect(roleLabel(null)).toBe("Utilisateur");
  });
});
