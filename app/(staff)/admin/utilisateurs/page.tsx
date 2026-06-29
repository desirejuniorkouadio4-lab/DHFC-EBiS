import Link from "next/link";
import { ArrowLeft, Inbox, Download, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listUsers, listCohortsAdmin } from "@/lib/admin/db";
import { UserSearch } from "@/components/admin/user-search";
import { CsvImport } from "@/components/admin/csv-import";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

const ASSIGNABLE_ROLES = ["APPRENANT", "TUTEUR", "ENCADREUR", "CONCEPTEUR", "ADMIN", "SUPERADMIN"];

const CREATE_MESSAGES: Record<string, { tone: "ok" | "err"; text: string }> = {
  ok: { tone: "ok", text: "Utilisateur créé (mot de passe temporaire : Bienvenue2026!)." },
  doublon: { tone: "err", text: "Un compte existe déjà avec cet e-mail." },
  invalide: { tone: "err", text: "Informations invalides : prénom, nom et e-mail valides requis." },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; created?: string; skipped?: string; import?: string; create?: string }>;
}) {
  const actor = await requireRole(["ADMIN", "SUPERADMIN"]);
  const { q = "", role = "ALL", created, skipped, import: importErr, create } = await searchParams;
  const [users, cohorts] = await Promise.all([listUsers({ q, role }), listCohortsAdmin()]);
  const roleOptions = ASSIGNABLE_ROLES.filter((r) => r !== "SUPERADMIN" || actor.role === "SUPERADMIN");
  const cohortOptions = cohorts.map((c) => ({ id: c.id, name: c.name }));
  const createMsg = create ? CREATE_MESSAGES[create] : undefined;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back-office
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Utilisateurs</h1>
        <p className="mt-1 text-[var(--text-secondary)]">{users.length} compte{users.length > 1 ? "s" : ""} affiché{users.length > 1 ? "s" : ""}.</p>
      </div>

      {/* Bannières de résultat */}
      {created !== undefined && (
        <Banner tone="ok">
          Import terminé : {created} compte{Number(created) > 1 ? "s" : ""} créé{Number(created) > 1 ? "s" : ""}
          {skipped && Number(skipped) > 0 ? `, ${skipped} ignoré${Number(skipped) > 1 ? "s" : ""} (doublons ou lignes invalides).` : "."}
        </Banner>
      )}
      {importErr && (
        <Banner tone="err">
          {importErr === "entete" ? "En-tête CSV invalide : firstName, lastName et email sont requis." : "Aucune ligne à importer."}
        </Banner>
      )}
      {createMsg && <Banner tone={createMsg.tone}>{createMsg.text}</Banner>}

      {/* Outils : créer / importer / exporter */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <CreateUserForm roleOptions={roleOptions} cohorts={cohortOptions} />
          <div className="flex shrink-0 flex-wrap gap-2">
            <a
              href="/api/admin/users/template"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
            >
              <FileSpreadsheet className="h-4 w-4" /> Modèle CSV
            </a>
            <a
              href="/api/admin/users/export"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
            >
              <Download className="h-4 w-4" /> Exporter CSV
            </a>
          </div>
        </div>
        <details className="group border-t border-[var(--border-subtle)] pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-orange-600">
            <Download className="h-4 w-4 rotate-180" /> Importer des comptes (CSV)
          </summary>
          <CsvImport />
        </details>
      </div>

      <UserSearch initialQ={q} initialRole={role} />

      {users.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Aucun utilisateur</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Affinez votre recherche ou modifiez le filtre.</p>
        </div>
      ) : (
        <UsersTable users={users} cohorts={cohortOptions} roleOptions={roleOptions} actorId={actor.id} />
      )}
    </div>
  );
}

function Banner({ tone, children }: { tone: "ok" | "err"; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${
        tone === "ok"
          ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
          : "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
      }`}
    >
      {tone === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
      {children}
    </div>
  );
}
