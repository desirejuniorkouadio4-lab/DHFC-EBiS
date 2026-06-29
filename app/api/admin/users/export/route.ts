import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helpers";
import { toCsv } from "@/lib/admin/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Export CSV de tous les utilisateurs (admin). */
export async function GET(): Promise<Response> {
  const actor = await getSessionUser();
  if (!actor || (actor.role !== "ADMIN" && actor.role !== "SUPERADMIN")) {
    return new Response("Non autorisé", { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      bivalence: true,
      region: true,
      dren: true,
      college: true,
      active: true,
      createdAt: true,
    },
  });

  const header = ["firstName", "lastName", "email", "role", "bivalence", "region", "dren", "college", "active", "createdAt"];
  const rows = users.map((u) => [
    u.firstName,
    u.lastName,
    u.email,
    u.role,
    u.bivalence,
    u.region,
    u.dren,
    u.college,
    u.active ? "oui" : "non",
    u.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = "﻿" + toCsv(header, rows); // BOM pour Excel
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="utilisateurs-dhfc-${date}.csv"`,
    },
  });
}
