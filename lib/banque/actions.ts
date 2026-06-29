"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import type { Exercice } from "@/lib/exercices/types";
import { TYPE_LABEL, EXERCICE_TYPES } from "@/lib/exercices/types";

const CONCEPTEUR_ROLES = ["CONCEPTEUR", "ADMIN", "SUPERADMIN"];

export type BankItem = {
  id: string;
  label: string;
  type: string;
  discipline: string | null;
  theme: string | null;
  category: string | null;
  lessonId: string | null;
  data: Exercice;
  updatedAt: string;
};

type Meta = { discipline?: string; theme?: string };

function safeLabel(ex: Exercice): string {
  const p = (ex.prompt ?? "").trim();
  if (p) return p.slice(0, 160);
  return TYPE_LABEL[ex.type] ?? "Question";
}

/** Enregistre un exercice dans la banque (depuis le builder ou la page banque). */
export async function saveToBank(ex: Exercice, meta: Meta = {}): Promise<{ ok: boolean }> {
  const actor = await requireRole(CONCEPTEUR_ROLES);
  if (!ex || !EXERCICE_TYPES.includes(ex.type)) return { ok: false };
  await prisma.bankQuestion.create({
    data: {
      label: safeLabel(ex),
      type: ex.type,
      discipline: meta.discipline?.trim() || null,
      theme: meta.theme?.trim() || null,
      data: ex as object,
      createdById: actor.id,
    },
  });
  revalidatePath("/concepteur/banque");
  return { ok: true };
}

/** Met à jour une question de la banque. */
export async function updateBankQuestion(id: string, ex: Exercice, meta: Meta = {}): Promise<{ ok: boolean }> {
  await requireRole(CONCEPTEUR_ROLES);
  if (!ex || !EXERCICE_TYPES.includes(ex.type)) return { ok: false };
  await prisma.bankQuestion.update({
    where: { id },
    data: {
      label: safeLabel(ex),
      type: ex.type,
      discipline: meta.discipline?.trim() || null,
      theme: meta.theme?.trim() || null,
      data: ex as object,
    },
  });
  revalidatePath("/concepteur/banque");
  return { ok: true };
}

/** Supprime une question de la banque. */
export async function deleteBankQuestion(id: string): Promise<void> {
  await requireRole(CONCEPTEUR_ROLES);
  await prisma.bankQuestion.delete({ where: { id } });
  revalidatePath("/concepteur/banque");
}

/** Recherche dans la banque (appelée depuis le sélecteur d'import du builder). */
export async function searchBank(
  filter: { q?: string; type?: string; discipline?: string; category?: string } = {}
): Promise<BankItem[]> {
  await requireRole(CONCEPTEUR_ROLES);
  const q = (filter.q ?? "").trim();
  const rows = await prisma.bankQuestion.findMany({
    where: {
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.discipline ? { discipline: filter.discipline } : {}),
      ...(filter.category ? { category: filter.category } : {}),
      ...(q ? { label: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    type: r.type,
    discipline: r.discipline,
    theme: r.theme,
    category: r.category,
    lessonId: r.lessonId,
    data: r.data as Exercice,
    updatedAt: r.updatedAt.toISOString(),
  }));
}
