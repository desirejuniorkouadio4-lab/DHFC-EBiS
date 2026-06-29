import "server-only";
import { prisma } from "@/lib/prisma";
import type { BankItem } from "@/lib/banque/actions";
import type { Exercice } from "@/lib/exercices/types";

/** Liste complète de la banque (page de gestion concepteur). */
export async function listBankQuestions(): Promise<BankItem[]> {
  const rows = await prisma.bankQuestion.findMany({ orderBy: { updatedAt: "desc" }, take: 300 });
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    type: r.type,
    discipline: r.discipline,
    theme: r.theme,
    data: r.data as Exercice,
    updatedAt: r.updatedAt.toISOString(),
  }));
}
