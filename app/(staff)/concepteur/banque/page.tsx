import Link from "next/link";
import { ArrowLeft, Library } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listBankQuestions } from "@/lib/banque/db";
import { BankManager } from "@/components/banque/bank-manager";

export const dynamic = "force-dynamic";

export default async function BanquePage() {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
  const items = await listBankQuestions();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/concepteur" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-orange-600">
          <ArrowLeft className="h-4 w-4" /> Espace concepteur
        </Link>
        <div className="mt-3 flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
            <Library className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Banque de questions</h1>
            <p className="mt-1 max-w-xl text-[var(--text-secondary)]">
              Constituez une réserve d'exercices réutilisables, filtrables par type et discipline, et
              importables dans n'importe quel quiz.
            </p>
          </div>
        </div>
      </div>

      <BankManager initialItems={items} blobEnabled={!!process.env.BLOB_READ_WRITE_TOKEN} />
    </div>
  );
}
