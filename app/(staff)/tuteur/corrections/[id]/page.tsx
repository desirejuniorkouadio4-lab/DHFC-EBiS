import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ClipboardCheck, FileText, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getSubmissionForTutor } from "@/lib/tuteur/corrections";
import { gradeSubmission } from "@/lib/tuteur/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";

export const dynamic = "force-dynamic";

export default async function CorrectionPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole(["TUTEUR", "ENCADREUR", "ADMIN", "SUPERADMIN"]);
  const { id } = await params;
  const sub = await getSubmissionForTutor(id, actor);
  if (!sub) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/tuteur/corrections"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> File de correction
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-sm font-bold text-white">
            {sub.initials}
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{sub.learnerName}</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {sub.cohortName ?? "—"}
              {sub.college ? ` · ${sub.college}` : ""}
            </p>
          </div>
          {sub.status === "GRADED" && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Corrigé {sub.score}/{sub.maxScore}
            </span>
          )}
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <BookOpen className="h-4 w-4" /> {sub.parcoursTitle} · {sub.lessonTitle}
        </p>
      </div>

      {/* Énoncé */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <FileText className="h-4 w-4 text-orange-500" /> Énoncé
        </h2>
        <p className="mt-2 text-sm">{sub.prompt}</p>
        {sub.rubric && (
          <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Grille de notation</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{sub.rubric}</p>
          </div>
        )}
      </section>

      {/* Réponse de l'apprenant */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <h2 className="text-sm font-bold">Réponse de l'apprenant</h2>
        <div className="mt-2 whitespace-pre-wrap rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 text-sm leading-relaxed">
          {sub.answer}
        </div>
      </section>

      {/* Correction */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <ClipboardCheck className="h-4 w-4 text-orange-500" /> Correction
        </h2>
        <form action={gradeSubmission.bind(null, sub.id)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="score" className="text-sm font-medium">
              Note <span className="text-[var(--text-secondary)]">(sur {sub.maxScore})</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="score"
                name="score"
                type="number"
                min={0}
                max={sub.maxScore}
                required
                defaultValue={sub.score ?? ""}
                className="h-11 w-28 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <span className="text-sm text-[var(--text-secondary)]">/ {sub.maxScore}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="feedback" className="text-sm font-medium">
              Commentaire
            </label>
            <textarea
              id="feedback"
              name="feedback"
              rows={4}
              defaultValue={sub.feedback ?? ""}
              placeholder="Points forts, axes d'amélioration, encouragements…"
              className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="flex justify-end">
            <SubmitButton pendingLabel="Enregistrement…" className="px-5">
              <CheckCircle2 className="h-4 w-4" /> {sub.status === "GRADED" ? "Mettre à jour" : "Valider la note"}
            </SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
