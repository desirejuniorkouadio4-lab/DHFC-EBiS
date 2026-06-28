import Link from "next/link";
import { Users, GraduationCap, TrendingUp, AlertTriangle, ArrowRight, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getTutorCohorts } from "@/lib/tuteur/db";

export const dynamic = "force-dynamic";

export default async function TuteurPage() {
  const actor = await requireRole(["TUTEUR", "ENCADREUR", "ADMIN", "SUPERADMIN"]);
  const cohorts = await getTutorCohorts(actor);

  const totalLearners = cohorts.reduce((a, c) => a + c.learnerCount, 0);
  const totalWatch = cohorts.reduce((a, c) => a + c.toWatch, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
          <GraduationCap className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes cohortes</h1>
          <p className="mt-1 max-w-xl text-[var(--text-secondary)]">
            Suivez l'avancement de vos apprenants et repérez ceux à accompagner.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
        <Stat icon={Users} label="Apprenants" value={totalLearners} />
        <Stat icon={GraduationCap} label="Cohortes" value={cohorts.length} />
        <Stat icon={AlertTriangle} label="À suivre" value={totalWatch} tone="amber" />
      </div>

      {cohorts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Aucune cohorte attribuée</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Vous n'êtes encore le tuteur d'aucune cohorte. Contactez votre administrateur.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cohorts.map((c) => (
            <Link
              key={c.id}
              href={`/tuteur/cohorte/${c.id}`}
              className="group flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold leading-snug group-hover:text-orange-600">{c.name}</h2>
                {c.toWatch > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" /> {c.toWatch}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {c.learnerCount} apprenants
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> {c.parcoursCount} parcours
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--text-secondary)]">
                    <TrendingUp className="h-3.5 w-3.5" /> Avancement moyen
                  </span>
                  <span className="font-bold text-orange-600">{c.avgProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500" style={{ width: `${c.avgProgress}%` }} />
                </div>
              </div>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                Ouvrir le suivi <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone?: "amber";
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
      <Icon className={`h-5 w-5 ${tone === "amber" ? "text-amber-600" : "text-orange-500"}`} />
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
