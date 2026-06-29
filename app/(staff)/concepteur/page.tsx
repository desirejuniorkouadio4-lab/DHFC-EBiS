import Link from "next/link";
import { Plus, PencilRuler, Layers, BookOpen, Users, Pencil, CheckCircle2, FileEdit, Library } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listParcoursForConcepteur } from "@/lib/concepteur/db";

export const dynamic = "force-dynamic";

const LEVEL_FR: Record<string, string> = {
  DEBUTANT: "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  AVANCE: "Avancé",
};

export default async function ConcepteurPage() {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
  const parcours = await listParcoursForConcepteur();
  const published = parcours.filter((p) => p.published).length;
  const drafts = parcours.length - published;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
            <PencilRuler className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Espace concepteur</h1>
            <p className="mt-1 max-w-xl text-[var(--text-secondary)]">
              Créez et structurez les parcours pédagogiques, puis publiez-les pour les cohortes.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/concepteur/banque"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] px-5 text-sm font-semibold transition-colors hover:border-orange-400 hover:text-orange-600"
          >
            <Library className="h-4 w-4" /> Banque de questions
          </Link>
          <Link
            href="/concepteur/nouveau"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" /> Nouveau parcours
          </Link>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        <Stat label="Parcours" value={parcours.length} />
        <Stat label="Publiés" value={published} tone="green" />
        <Stat label="Brouillons" value={drafts} tone="orange" />
      </div>

      {/* Liste des parcours */}
      {parcours.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Layers className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Aucun parcours pour l'instant</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Commencez par créer votre premier parcours.
          </p>
          <Link
            href="/concepteur/nouveau"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" /> Créer un parcours
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parcours.map((p) => (
            <Link
              key={p.id}
              href={`/concepteur/${p.slug}`}
              className="group flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${p.disciplineColor}1a`, color: p.disciplineColor }}
                >
                  {p.disciplineShort}
                </span>
                {p.published ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Publié
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <FileEdit className="h-3.5 w-3.5" /> Brouillon
                  </span>
                )}
              </div>

              <h2 className="mt-3 line-clamp-2 font-bold leading-snug group-hover:text-orange-600">
                {p.title || "Sans titre"}
              </h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{LEVEL_FR[p.level]}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> {p.modulesCount} mod.
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> {p.lessonsCount} leçons
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {p.enrolledCount}
                </span>
              </div>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                <Pencil className="h-4 w-4" /> Modifier
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "green" | "orange" }) {
  const color =
    tone === "green" ? "text-green-600" : tone === "orange" ? "text-amber-600" : "text-[var(--text-primary)]";
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
