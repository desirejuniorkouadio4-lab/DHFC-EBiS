import Link from "next/link";
import {
  Map,
  Users,
  TrendingUp,
  Activity,
  ClipboardCheck,
  GraduationCap,
  AlertTriangle,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getEncadreurOverview } from "@/lib/encadreur/db";

export const dynamic = "force-dynamic";

export default async function EncadreurPage() {
  await requireRole(["ENCADREUR", "ADMIN", "SUPERADMIN"]);
  const o = await getEncadreurOverview();

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
          <Map className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Supervision du dispositif</h1>
          <p className="mt-1 max-w-xl text-[var(--text-secondary)]">
            Vue d'ensemble des cohortes et comparaison de l'activité des tuteurs.
          </p>
        </div>
      </div>

      {/* Indicateurs globaux */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi icon={Users} label="Apprenants" value={o.totalLearners} href="/tuteur" />
        <Kpi icon={Activity} label="Actifs (7 j)" value={o.activeLast7d} tone="green" href="/tuteur" />
        <Kpi icon={TrendingUp} label="Complétion moy." value={`${o.avgCompletion}%`} tone="orange" href="/tuteur" />
        <Kpi icon={GraduationCap} label="Cohortes" value={o.cohortsCount} hint={o.unassignedCohorts ? `${o.unassignedCohorts} sans tuteur` : undefined} href="/tuteur" />
        <Kpi icon={ClipboardCheck} label="À corriger" value={o.pendingCorrections} tone={o.pendingCorrections ? "amber" : undefined} href="/tuteur/corrections" />
      </div>

      {/* Comparaison entre tuteurs */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-500" />
          <h2 className="font-bold">Comparaison entre tuteurs</h2>
          <span className="text-sm text-[var(--text-secondary)]">({o.tutorsCount})</span>
        </div>

        {o.tutors.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center text-sm text-[var(--text-secondary)]">
            Aucun tuteur n'est encore rattaché à une cohorte.
          </p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            {/* En-tête (desktop) */}
            <div className="hidden grid-cols-[1.6fr_0.8fr_0.8fr_1.2fr_0.9fr_0.9fr] gap-3 border-b border-[var(--border-subtle)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] lg:grid">
              <span>Tuteur</span>
              <span>Cohortes</span>
              <span>Apprenants</span>
              <span>Complétion moy.</span>
              <span>En difficulté</span>
              <span>À corriger</span>
            </div>

            <ul>
              {o.tutors.map((t, i) => (
                <li
                  key={t.tutorId}
                  className="grid grid-cols-2 gap-3 border-b border-[var(--border-subtle)] px-4 py-3 last:border-0 lg:grid-cols-[1.6fr_0.8fr_0.8fr_1.2fr_0.9fr_0.9fr] lg:items-center lg:px-5"
                >
                  <div className="col-span-2 flex items-center gap-3 lg:col-span-1">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
                      {t.tutorName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 truncate text-sm font-semibold">
                      {i === 0 && <span className="mr-1">🏆</span>}
                      {t.tutorName}
                    </span>
                  </div>

                  <Cell label="Cohortes" value={t.cohortsCount} />
                  <Cell label="Apprenants" value={t.learnersCount} />

                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500" style={{ width: `${t.avgCompletion}%` }} />
                    </div>
                    <span className="w-9 shrink-0 text-right text-xs font-bold text-orange-600">{t.avgCompletion}%</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm lg:block">
                    <span className="text-xs text-[var(--text-secondary)] lg:hidden">En difficulté :</span>
                    <span className={t.inactiveCount ? "font-semibold text-amber-600" : "text-[var(--text-secondary)]"}>
                      {t.inactiveCount > 0 && <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />}
                      {t.inactiveCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm lg:block">
                    <span className="text-xs text-[var(--text-secondary)] lg:hidden">À corriger :</span>
                    <span className={t.pendingCorrections ? "font-semibold text-orange-600" : "text-[var(--text-secondary)]"}>
                      {t.pendingCorrections}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Accès au détail */}
      <Link
        href="/tuteur"
        className="group inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline"
      >
        <ExternalLink className="h-4 w-4" /> Explorer le détail des cohortes
      </Link>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  href,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  hint?: string;
  tone?: "green" | "orange" | "amber";
  href?: string;
}) {
  const color =
    tone === "green" ? "text-green-600" : tone === "orange" ? "text-orange-600" : tone === "amber" ? "text-amber-600" : "text-[var(--text-primary)]";
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-[var(--text-secondary)]" />
        {href && <ExternalLink className="h-3.5 w-3.5 text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-100" />}
      </div>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-amber-600">{hint}</p>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
        {inner}
      </Link>
    );
  }
  return <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">{inner}</div>;
}

function Cell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-sm">
      <span className="text-xs text-[var(--text-secondary)] lg:hidden">{label} : </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
