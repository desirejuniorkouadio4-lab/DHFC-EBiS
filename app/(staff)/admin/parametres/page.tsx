import Link from "next/link";
import { ArrowLeft, Megaphone, Wrench, Check, Mail, Plug } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getSiteSettings } from "@/lib/settings";
import { updateSiteSettings } from "@/lib/admin/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";

export const dynamic = "force-dynamic";

const textareaClass =
  "mt-2 w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none focus:border-orange-500";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const s = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back-office
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Paramètres système</h1>
        <p className="mt-1 text-[var(--text-secondary)]">Bandeau d'annonce, maintenance et intégrations.</p>
      </div>

      <form action={updateSiteSettings} className="space-y-5">
        {/* Annonce */}
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Megaphone className="h-5 w-5 text-orange-500" /> Bandeau d'annonce
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Affiché en haut de toutes les pages du site.</p>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="announcementEnabled" defaultChecked={s.announcementEnabled} className="h-4 w-4 rounded accent-orange-500" />
            <span className="text-sm font-medium">Afficher le bandeau</span>
          </label>
          <textarea
            name="announcementText"
            rows={2}
            maxLength={300}
            defaultValue={s.announcementText}
            placeholder="ex. Les inscriptions à la cohorte de septembre sont ouvertes !"
            className={textareaClass}
          />
        </section>

        {/* Maintenance */}
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Wrench className="h-5 w-5 text-orange-500" /> Mode maintenance
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Affiche un bandeau d'information de maintenance.</p>
          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input type="checkbox" name="maintenanceEnabled" defaultChecked={s.maintenanceEnabled} className="h-4 w-4 rounded accent-orange-500" />
            <span className="text-sm font-medium">Activer le bandeau de maintenance</span>
          </label>
          <textarea name="maintenanceText" rows={2} maxLength={300} defaultValue={s.maintenanceText} className={textareaClass} />
        </section>

        <div className="flex justify-end">
          <SubmitButton pendingLabel="Enregistrement…" className="px-5">
            <Check className="h-4 w-4" /> Enregistrer
          </SubmitButton>
        </div>
      </form>

      {/* Intégrations (informatif) */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <Plug className="h-5 w-5 text-orange-500" /> Intégrations
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          <Integration icon={Mail} name="Resend (e-mails)" status="À configurer" />
          <Integration icon={Plug} name="Vercel Blob (stockage)" status="Connecté" ok />
        </ul>
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          Les clés d'intégration se configurent dans les variables d'environnement du projet (Vercel).
        </p>
      </section>
    </div>
  );
}

function Integration({ icon: Icon, name, status, ok }: { icon: typeof Mail; name: string; status: string; ok?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] px-4 py-3">
      <span className="flex items-center gap-2.5 font-medium">
        <Icon className="h-4 w-4 text-[var(--text-secondary)]" /> {name}
      </span>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          ok ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        }`}
      >
        {status}
      </span>
    </li>
  );
}
