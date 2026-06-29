import { getSessionUser } from "@/lib/auth-helpers";
import { toCsv } from "@/lib/admin/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Modèle CSV d'import d'utilisateurs (en-tête + exemples). */
export async function GET(): Promise<Response> {
  const actor = await getSessionUser();
  if (!actor || (actor.role !== "ADMIN" && actor.role !== "SUPERADMIN")) {
    return new Response("Non autorisé", { status: 403 });
  }

  const header = ["firstName", "lastName", "email", "role", "bivalence", "region", "dren", "college"];
  const rows = [
    ["Aya", "Koffi", "aya.koffi@exemple.ci", "APPRENANT", "PC · SVT", "Gbêkê", "DREN Bouaké", "Collège Moderne 1"],
    ["Brou", "Yao", "brou.yao@exemple.ci", "TUTEUR", "", "Abidjan", "DREN Abidjan 2", ""],
  ];

  const csv = "﻿" + toCsv(header, rows); // BOM pour Excel
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modele-import-utilisateurs.csv"`,
    },
  });
}
