import Link from "next/link";
import { ArrowLeft, Plus, Users, BookOpen, Check, GraduationCap, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listCohortsAdmin, listTutors } from "@/lib/admin/db";
import { createCohort, assignCohortTutor } from "@/lib/admin/actions";
import { SubmitButton, IconSubmit } from "@/components/concepteur/submit-button";

export const dynamic = "force-dynamic";

export default async function AdminCohortsPage() {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const [cohorts, tutors] = await Promise.all([listCohortsAdmin(), listTutors()]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back-office
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Cohortes</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Créez les cohortes et affectez-leur un tuteur.</p>
      </div>

      {/* Création */}
      <form
        action={createCohort}
        className="flex flex-col gap-3 rounded-3xl border border-dashed border-[var(--border-subtle)] p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Nom de la cohorte <span className="text-orange-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="ex. Cohorte Septembre 2026 — MATH/TICE"
            className="h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 text-sm outline-none focus:border-orange-500"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tutorId" className="text-sm font-medium">
            Tuteur
          </label>
          <select
            id="tutorId"
            name="tutorId"
            defaultValue=""
            className="h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-orange-500 sm:w-64"
          >
            <option value="">Aucun pour l'instant</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton pendingLabel="Création…" className="px-5">
          <Plus className="h-4 w-4" /> Créer
        </SubmitButton>
      </form>

      {/* Liste */}
      <ul className="space-y-2">
        {cohorts.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 lg:flex-row lg:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{c.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {c.learnerCount} apprenants
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> {c.parcoursCount} parcours
                </span>
              </p>
            </div>

            {/* Affectation tuteur */}
            <form action={assignCohortTutor.bind(null, c.id)} className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
              <select
                name="tutorId"
                defaultValue={c.tutorId ?? ""}
                aria-label={`Tuteur de ${c.name}`}
                className="h-9 min-w-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500"
              >
                <option value="">Aucun tuteur</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <IconSubmit label="Enregistrer le tuteur">
                <Check className="h-4 w-4" />
              </IconSubmit>
            </form>

            <Link
              href={`/tuteur/cohorte/${c.id}`}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-[var(--border-subtle)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600 lg:self-auto"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Suivi
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
