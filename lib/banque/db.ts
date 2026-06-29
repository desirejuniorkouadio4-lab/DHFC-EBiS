import "server-only";
import { prisma } from "@/lib/prisma";
import type { BankItem } from "@/lib/banque/actions";
import type { Exercice } from "@/lib/exercices/types";

/** Liste complète de la banque (page de gestion concepteur). */
export async function listBankQuestions(): Promise<BankItem[]> {
  const rows = await prisma.bankQuestion.findMany({ orderBy: { updatedAt: "desc" }, take: 500 });
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

/** Catégories distinctes (auto par leçon), triées, avec nombre de questions. */
export async function listBankCategories(): Promise<{ name: string; count: number }[]> {
  const rows = await prisma.bankQuestion.groupBy({
    by: ["category"],
    where: { category: { not: null } },
    _count: { _all: true },
    orderBy: { category: "asc" },
  });
  return rows
    .filter((r) => r.category)
    .map((r) => ({ name: r.category as string, count: r._count._all }));
}
