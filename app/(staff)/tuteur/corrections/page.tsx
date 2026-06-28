import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, Inbox, BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getSubmissionsForTutor } from "@/lib/tuteur/corrections";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "PENDING", label: "À corriger" },
  { key: "GRADED", label: "Corrigés" },
  { key: "ALL", label: "Tous" },
] as const;

function relativeTime(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `il y a ${Math.max(1, mins)} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  return `il y a ${Math.round(days / 7)} sem.`;
}

export default async function CorrectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const actor = await requireRole(["TUTEUR", "ENCADREUR", "ADMIN", "SUPERADMIN"]);
  const { status } = await searchParams;
  const active = (TABS.find((t) => t.key === status)?.key ?? "PENDING") as "PENDING" | "GRADED" | "ALL";
  const submissions = await getSubmissionsForTutor(actor, active);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/tuteur"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Mes cohortes
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">File de correction</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Réponses longues déposées par vos apprenants.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/tuteur/corrections?status=${t.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active === t.key
                ? "bg-orange-500 text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Rien à afficher</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {active === "PENDING" ? "Aucune copie en attente de correction. " : "Aucune copie dans cette catégorie."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {submissions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/tuteur/corrections/${s.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-orange-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
                  {s.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold group-hover:text-orange-600">{s.learnerName}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[var(--text-secondary)]">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" /> {s.parcoursTitle} · {s.lessonTitle}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--text-secondary)]">{s.prompt}</p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  {s.status === "PENDING" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <Clock className="h-3.5 w-3.5" /> En attente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {s.score}/{s.maxScore}
                    </span>
                  )}
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{relativeTime(s.createdAt)}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
