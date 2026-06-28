import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listDisciplines } from "@/lib/concepteur/db";
import { createParcours } from "@/lib/concepteur/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";

export const dynamic = "force-dynamic";

const inputClass =
  "h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

export default async function NouveauParcoursPage() {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
  const disciplines = await listDisciplines();

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/concepteur"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux parcours
      </Link>

      <h1 className="mt-5 text-2xl font-bold tracking-tight">Nouveau parcours</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        Renseignez l'essentiel. Vous compléterez les détails et la structure à l'étape suivante.
      </p>

      <form action={createParcours} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium">
            Titre du parcours <span className="text-orange-600">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="ex. Enseigner la démarche scientifique au collège"
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="disciplineId" className="text-sm font-medium">
              Discipline <span className="text-orange-600">*</span>
            </label>
            <select id="disciplineId" name="disciplineId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Choisir…
              </option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="level" className="text-sm font-medium">
              Niveau
            </label>
            <select id="level" name="level" defaultValue="DEBUTANT" className={inputClass}>
              <option value="DEBUTANT">Débutant</option>
              <option value="INTERMEDIAIRE">Intermédiaire</option>
              <option value="AVANCE">Avancé</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/concepteur"
            className="inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Annuler
          </Link>
          <SubmitButton pendingLabel="Création…" className="px-5">
            <Plus className="h-4 w-4" /> Créer le parcours
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
