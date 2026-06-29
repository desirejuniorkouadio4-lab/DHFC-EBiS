import Link from "next/link";
import {
  Settings,
  Users,
  GraduationCap,
  Activity,
  BookOpen,
  TrendingUp,
  ClipboardCheck,
  Layers,
  ArrowRight,
  UserPlus,
  PencilRuler,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getAdminStats } from "@/lib/admin/db";
import { roleLabel } from "@/lib/rbac";
import { impersonateRole } from "@/lib/admin/impersonate";
import { Eye, LogIn } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const s = await getAdminStats();

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
          <Settings className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Back-office</h1>
          <p className="mt-1 max-w-xl text-[var(--text-secondary)]">
            Pilotez la plateforme : utilisateurs, cohortes, contenus et indicateurs.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi icon={Users} label="Utilisateurs" value={s.totalUsers} hint={`${s.activeUsers} actifs`} href="/admin/utilisateurs" />
        <Kpi icon={GraduationCap} label="Apprenants" value={s.learners} href="/admin/utilisateurs?role=APPRENANT" />
        <Kpi icon={Activity} label="Actifs (7 j)" value={s.activeLast7d} tone="green" href="/admin/analytics" />
        <Kpi icon={BookOpen} label="Inscriptions" value={s.enrollments} href="/admin/analytics" />
        <Kpi icon={TrendingUp} label="Complétion moy." value={`${s.avgCompletion}%`} tone="orange" href="/admin/analytics" />
        <Kpi icon={ClipboardCheck} label="Devoirs à corriger" value={s.pendingCorrections} tone={s.pendingCorrections ? "amber" : undefined} href="/tuteur/corrections" />
        <Kpi icon={Layers} label="Parcours publiés" value={s.publishedParcours} hint={`${s.draftParcours} brouillon${s.draftParcours > 1 ? "s" : ""}`} href="/concepteur?statut=publies" />
        <Kpi icon={GraduationCap} label="Cohortes" value={s.cohorts} href="/admin/cohortes" />
      </div>

      {/* Accès rapides */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/admin/utilisateurs" icon={Users} title="Utilisateurs" desc="Rôles, recherche, activation des comptes." />
        <QuickLink href="/admin/cohortes" icon={GraduationCap} title="Cohortes" desc="Création et affectation des tuteurs." />
        <QuickLink href="/admin/media" icon={ImageIcon} title="Médiathèque" desc="Images et PDF réutilisables." />
        <QuickLink href="/concepteur" icon={PencilRuler} title="Contenus" desc="Parcours, modules, leçons et exercices." />
        <QuickLink href="/admin/analytics" icon={BarChart3} title="Analytique" desc="Activité, rôles, complétion." />
        <QuickLink href="/admin/parametres" icon={Settings} title="Paramètres" desc="Annonce, maintenance, intégrations." />
      </div>

      {/* Prendre un rôle (impersonation) */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <Eye className="h-5 w-5 text-orange-500" /> Voir la plateforme en tant que…
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Prenez n'importe quel rôle pour tester l'expérience, ou{" "}
          <Link href="/admin/utilisateurs" className="font-semibold text-orange-600 hover:underline">
            connectez-vous comme un utilisateur précis
          </Link>
          . Le retour à votre compte est immédiat via le bandeau.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["APPRENANT", "TUTEUR", "ENCADREUR", "CONCEPTEUR"].map((r) => (
            <form key={r} action={impersonateRole.bind(null, r)}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold transition-colors hover:border-orange-400 hover:text-orange-600"
              >
                <LogIn className="h-4 w-4" /> {roleLabel(r)}
              </button>
            </form>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Parcours les plus suivis */}
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <TrendingUp className="h-5 w-5 text-orange-500" /> Parcours les plus suivis
          </h2>
          <ul className="mt-4 space-y-3">
            {s.topParcours.map((p, i) => (
              <li key={p.slug} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-600 dark:bg-orange-500/10">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.title}</span>
                <span className="shrink-0 text-sm font-semibold text-[var(--text-secondary)]">{p.enrolled} insc.</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Dernières inscriptions */}
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold">
              <UserPlus className="h-5 w-5 text-orange-500" /> Derniers comptes
            </h2>
            <Link href="/admin/utilisateurs" className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline">
              Tous <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {s.recentSignups.map((u) => (
              <li key={u.id} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
                  {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{u.name}</span>
                <span className="shrink-0 rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                  {roleLabel(u.role)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
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
        {href && <ArrowRight className="h-4 w-4 text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-100" />}
      </div>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-[var(--text-secondary)] opacity-80">{hint}</p>}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
      >
        {inner}
      </Link>
    );
  }
  return <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">{inner}</div>;
}

function QuickLink({ href, icon: Icon, title, desc }: { href: string; icon: typeof Users; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-colors hover:border-orange-300"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold group-hover:text-orange-600">{title}</p>
        <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
