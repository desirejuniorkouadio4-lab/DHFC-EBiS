import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, TrendingUp, AlertTriangle, MoonStar, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getCohortForTutor } from "@/lib/tuteur/db";
import { CohortTable, type Filter } from "@/components/tuteur/cohort-table";

export const dynamic = "force-dynamic";

const VALID_FILTERS: Filter[] = ["tous", "inactif", "en-difficulte", "termine"];

function relativeTime(date: Date | null): string {
  if (!date) return "Jamais";
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `Il y a ${Math.max(1, mins)} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.round(days / 7);
  return `Il y a ${weeks} sem.`;
}

export default async function CohortDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const actor = await requireRole(["TUTEUR", "ENCADREUR", "ADMIN", "SUPERADMIN"]);
  const { id } = await params;
  const { filter } = await searchParams;
  const initialFilter: Filter = VALID_FILTERS.includes(filter as Filter) ? (filter as Filter) : "tous";
  const cohort = await getCohortForTutor(id, actor);
  if (!cohort) notFound();

  const learners = cohort.learners.map((l) => ({
    id: l.id,
    name: l.name,
    initials: l.initials,
    college: l.college,
    region: l.region,
    progress: l.progress,
    completedLessons: l.completedLessons,
    parcours: l.parcours,
    lastActivityLabel: relativeTime(l.lastActivity),
    status: l.status,
  }));

  const { stats } = cohort;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/tuteur"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Mes cohortes
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{cohort.name}</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          {stats.count} apprenants · avancement moyen {stats.avgProgress}%
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Apprenants" value={stats.count} href="#suivi" />
        <StatCard icon={MoonStar} label="Inactifs > 7j" value={stats.inactive} tone={stats.inactive ? "red" : undefined} href="?filter=inactif#suivi" />
        <StatCard icon={AlertTriangle} label="En difficulté" value={stats.atRisk} tone={stats.atRisk ? "amber" : undefined} href="?filter=en-difficulte#suivi" />
        <StatCard icon={CheckCircle2} label="Terminé" value={stats.finished} tone={stats.finished ? "green" : undefined} href="?filter=termine#suivi" />
      </div>

      <div id="suivi" className="scroll-mt-20 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h2 className="font-bold">Suivi des apprenants</h2>
        </div>
        <CohortTable learners={learners} initialFilter={initialFilter} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  href,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone?: "red" | "amber" | "green";
  href?: string;
}) {
  const color =
    tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : tone === "green" ? "text-green-600" : "text-[var(--text-primary)]";
  const inner = (
    <>
      <Icon className={`h-5 w-5 ${tone === "red" ? "text-red-500" : tone === "amber" ? "text-amber-500" : tone === "green" ? "text-green-500" : "text-[var(--text-secondary)]"}`} />
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="block rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
        {inner}
      </Link>
    );
  }
  return <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">{inner}</div>;
}
