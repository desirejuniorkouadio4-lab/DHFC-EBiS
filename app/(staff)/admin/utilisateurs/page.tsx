import Link from "next/link";
import { ArrowLeft, Check, Power, ShieldCheck, Inbox, Download, UserPlus, CheckCircle2, AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listUsers } from "@/lib/admin/db";
import { setUserRole, toggleUserActive } from "@/lib/admin/actions";
import { UserSearch } from "@/components/admin/user-search";
import { CsvImport } from "@/components/admin/csv-import";
import { IconSubmit } from "@/components/concepteur/submit-button";
import { ROLE_LABEL } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const ASSIGNABLE_ROLES = ["APPRENANT", "TUTEUR", "ENCADREUR", "CONCEPTEUR", "ADMIN", "SUPERADMIN"];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; created?: string; skipped?: string; import?: string }>;
}) {
  const actor = await requireRole(["ADMIN", "SUPERADMIN"]);
  const { q = "", role = "ALL", created, skipped, import: importErr } = await searchParams;
  const users = await listUsers({ q, role });
  const roleOptions = ASSIGNABLE_ROLES.filter((r) => r !== "SUPERADMIN" || actor.role === "SUPERADMIN");

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

      {/* Résultat d'import */}
      {created !== undefined && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Import terminé : {created} compte{Number(created) > 1 ? "s" : ""} créé{Number(created) > 1 ? "s" : ""}
          {skipped && Number(skipped) > 0 ? `, ${skipped} ignoré${Number(skipped) > 1 ? "s" : ""} (doublons ou lignes invalides).` : "."}
        </div>
      )}
      {importErr && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {importErr === "entete" ? "En-tête CSV invalide : firstName, lastName et email sont requis." : "Aucune ligne à importer."}
        </div>
      )}

      {/* Outils import / export */}
      <div className="flex flex-col gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <details className="group min-w-0 flex-1">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-orange-600">
            <UserPlus className="h-4 w-4" /> Importer des comptes (CSV)
          </summary>
          <CsvImport />
        </details>
        <a
          href="/api/admin/users/export"
          className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600 sm:self-auto"
        >
          <Download className="h-4 w-4" /> Exporter CSV
        </a>
      </div>

      <UserSearch initialQ={q} initialRole={role} />

      {users.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Aucun utilisateur</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Affinez votre recherche ou modifiez le filtre.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => {
            const isSelf = u.id === actor.id;
            return (
              <li
                key={u.id}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 lg:flex-row lg:items-center"
              >
                {/* Identité */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      u.active ? "bg-gradient-to-br from-orange-500 to-green-500" : "bg-neutral-400"
                    }`}
                  >
                    {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold">
                      {u.name}
                      {isSelf && (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-600 dark:bg-orange-500/10">
                          Vous
                        </span>
                      )}
                      {!u.active && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:bg-red-500/10">
                          Désactivé
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">{u.email}</p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">{u.college ?? u.region ?? "—"}</p>
                  </div>
                </div>

                {/* Rôle */}
                {isSelf ? (
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] lg:self-auto">
                    <ShieldCheck className="h-4 w-4" /> {ROLE_LABEL[u.role]}
                  </span>
                ) : (
                  <form action={setUserRole.bind(null, u.id)} className="flex items-center gap-1.5 self-start lg:self-auto">
                    <select
                      name="role"
                      defaultValue={u.role}
                      aria-label={`Rôle de ${u.name}`}
                      className="h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500"
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                    <IconSubmit label="Enregistrer le rôle">
                      <Check className="h-4 w-4" />
                    </IconSubmit>
                  </form>
                )}

                {/* Activation */}
                {!isSelf && (
                  <form action={toggleUserActive.bind(null, u.id)} className="self-start lg:self-auto">
                    <button
                      type="submit"
                      title={u.active ? "Désactiver le compte" : "Réactiver le compte"}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                        u.active
                          ? "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-red-300 hover:text-red-600"
                          : "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" /> {u.active ? "Désactiver" : "Réactiver"}
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
