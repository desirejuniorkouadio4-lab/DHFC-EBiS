import Link from "next/link";
import { ArrowLeft, Activity, Users, TrendingUp, BarChart3 } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getAnalytics, type Point } from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const a = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back-office
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Analytique</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Activité, répartition et complétion du dispositif.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
        <Stat icon={Activity} label="Leçons terminées (7 j)" value={a.totals.weekActivity} tone="green" />
        <Stat icon={TrendingUp} label="Complétion moyenne" value={`${a.totals.avgCompletion}%`} tone="orange" />
      </div>

      {/* Activité par semaine */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <BarChart3 className="h-5 w-5 text-orange-500" /> Leçons terminées par semaine
        </h2>
        <VerticalBars points={a.activityByWeek} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Répartition par rôle */}
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Users className="h-5 w-5 text-orange-500" /> Répartition par rôle
          </h2>
          <HorizontalBars points={a.roleDistribution} />
        </section>

        {/* Complétion par parcours */}
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <TrendingUp className="h-5 w-5 text-orange-500" /> Complétion moyenne par parcours
          </h2>
          <HorizontalBars points={a.parcoursCompletion} suffix="%" max={100} />
        </section>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number | string; tone?: "green" | "orange" }) {
  const color = tone === "green" ? "text-green-600" : tone === "orange" ? "text-orange-600" : "text-[var(--text-primary)]";
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
      <Icon className="h-5 w-5 text-[var(--text-secondary)]" />
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function VerticalBars({ points }: { points: Point[] }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className="mt-6 flex h-44 items-end gap-2">
      {points.map((p, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{p.value}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-green-500"
              style={{ height: `${Math.max(3, (p.value / max) * 100)}%` }}
              title={`${p.label} : ${p.value}`}
            />
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ points, suffix = "", max }: { points: Point[]; suffix?: string; max?: number }) {
  const top = max ?? Math.max(1, ...points.map((p) => p.value));
  if (points.length === 0) {
    return <p className="mt-4 text-sm text-[var(--text-secondary)]">Aucune donnée.</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {points.map((p, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-medium">{p.label}</span>
            <span className="shrink-0 font-semibold text-orange-600">
              {p.value}
              {suffix}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500" style={{ width: `${Math.max(2, (p.value / top) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
