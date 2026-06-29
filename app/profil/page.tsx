import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, ShieldCheck, Download, KeyRound, UserCog, AlertTriangle, FileDown, Database } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { getProfile } from "@/lib/profile/db";
import { updateProfile } from "@/lib/profile/actions";
import { roleLabel } from "@/lib/rbac";
import { PrivacySettings } from "@/components/profile/privacy-settings";
import { ChangePassword, DeleteAccount } from "@/components/profile/account-actions";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { ProgressBar } from "@/components/lms/progress-bar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition-colors focus:border-orange-500";

export default async function ProfilPage({ searchParams }: { searchParams: Promise<{ delete?: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect("/connexion");
  const p = await getProfile(session.id);
  if (!p) redirect("/connexion");
  const { delete: deleteParam } = await searchParams;

  const initials = `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase();
  const xpPercent = Math.min(100, Math.round((p.xp / Math.max(1, p.level * 300)) * 100));
  const blobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-2xl" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <AvatarUploader avatarUrl={p.avatarUrl} initials={initials} blobEnabled={blobEnabled} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {p.firstName} {p.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                {roleLabel(p.role)}
              </span>
              {p.bivalence && (
                <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                  Bivalence {p.bivalence}
                </span>
              )}
              <span className="text-xs text-[var(--text-secondary)]">Membre depuis le {formatDate(p.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="relative mt-6 rounded-2xl bg-[var(--bg-secondary)] p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-orange-500" /> Niveau {p.level}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">{p.xp} XP</span>
          </div>
          <ProgressBar value={xpPercent} />
        </div>
      </section>

      {/* Informations personnelles */}
      <Card title="Informations personnelles" icon={UserCog}>
        <form action={updateProfile} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Prénom *"><input name="firstName" required defaultValue={p.firstName} className={inputClass} /></Field>
            <Field label="Nom *"><input name="lastName" required defaultValue={p.lastName} className={inputClass} /></Field>
          </div>
          <Field label="E-mail (non modifiable ici)">
            <input value={p.email} disabled className={`${inputClass} cursor-not-allowed opacity-70`} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Téléphone"><input name="phone" defaultValue={p.phone ?? ""} placeholder="+225 …" className={inputClass} /></Field>
            <Field label="Bivalence"><input name="bivalence" defaultValue={p.bivalence ?? ""} placeholder="PC · SVT" className={inputClass} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Région"><input name="region" defaultValue={p.region ?? ""} className={inputClass} /></Field>
            <Field label="DREN"><input name="dren" defaultValue={p.dren ?? ""} className={inputClass} /></Field>
            <Field label="Collège"><input name="college" defaultValue={p.college ?? ""} className={inputClass} /></Field>
          </div>
          <Field label="Bio">
            <textarea name="bio" defaultValue={p.bio ?? ""} rows={3} maxLength={600} placeholder="Présentez-vous en quelques mots…" className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-orange-500" />
          </Field>
          <div className="flex justify-end">
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-semibold text-white hover:bg-orange-600">
              Enregistrer
            </button>
          </div>
        </form>
      </Card>

      {/* Confidentialité */}
      <Card title="Confidentialité &amp; données personnelles" icon={ShieldCheck}>
        <p className="-mt-2 mb-4 text-sm text-[var(--text-secondary)]">
          Vous gardez le contrôle de vos données. Vos choix sont enregistrés immédiatement.{" "}
          <Link href="/confidentialite" className="font-semibold text-orange-600 hover:underline">
            Politique de confidentialité
          </Link>
        </p>
        <PrivacySettings profile={p} />
      </Card>

      {/* Mes données (RGPD) */}
      <Card title="Mes données (RGPD)" icon={Database}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Inscriptions" value={p.counts.enrollments} />
          <Stat label="Leçons terminées" value={p.counts.completedLessons} />
          <Stat label="Certificats" value={p.counts.certificates} />
          <Stat label="Badges" value={p.counts.badges} />
          <Stat label="Messages envoyés" value={p.counts.messages} />
          <Stat label="Messages forum" value={p.counts.forumPosts} />
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FileDown className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-semibold">Exporter mes données</p>
              <p className="text-xs text-[var(--text-secondary)]">Téléchargez l'ensemble de vos données personnelles (droit à la portabilité).</p>
            </div>
          </div>
          <a
            href="/api/profil/export"
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full border border-[var(--border-subtle)] px-5 text-sm font-semibold transition-colors hover:border-orange-400 hover:text-orange-600 sm:self-auto"
          >
            <Download className="h-4 w-4" /> Exporter (JSON)
          </a>
        </div>
      </Card>

      {/* Sécurité */}
      <Card title="Sécurité" icon={KeyRound}>
        <ChangePassword />
      </Card>

      {/* Zone de danger */}
      <Card title="Supprimer mon compte" icon={AlertTriangle} danger>
        {deleteParam === "confirme" && (
          <p className="-mt-2 mb-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
            <AlertTriangle className="h-4 w-4" /> Confirmation incorrecte — tapez exactement « SUPPRIMER ».
          </p>
        )}
        <p className="-mt-2 mb-4 text-sm text-[var(--text-secondary)]">
          Conformément au droit à l'effacement (RGPD), vous pouvez supprimer définitivement votre compte et toutes vos
          données.
        </p>
        <DeleteAccount />
      </Card>
    </div>
  );
}

function Card({ title, icon: Icon, danger, children }: { title: string; icon: typeof Zap; danger?: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-3xl border bg-[var(--bg-elevated)] p-6 ${danger ? "border-red-200 dark:border-red-500/30" : "border-[var(--border-subtle)]"}`}>
      <h2 className="mb-4 flex items-center gap-2 font-bold">
        <Icon className={`h-5 w-5 ${danger ? "text-red-500" : "text-orange-500"}`} /> {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
