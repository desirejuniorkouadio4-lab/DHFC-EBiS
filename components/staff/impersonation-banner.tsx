import { Eye, Undo2 } from "lucide-react";
import { roleLabel } from "@/lib/rbac";
import { stopImpersonation } from "@/lib/admin/impersonate";

/**
 * Bandeau affiché quand un admin agit « en tant que » un autre utilisateur.
 * Rendu en haut des coques (apprenant/staff) ; le retour est réversible.
 */
export function ImpersonationBanner({
  name,
  role,
  by,
}: {
  name: string;
  role: string;
  by?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-4 w-4" />
        Vous agissez en tant que <strong>{name}</strong> ({roleLabel(role)})
        {by ? ` — connecté : ${by}` : ""}
      </span>
      <form action={stopImpersonation}>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-950 px-3 py-1 text-xs font-bold text-amber-50 transition-colors hover:bg-amber-900"
        >
          <Undo2 className="h-3.5 w-3.5" /> Revenir à mon compte
        </button>
      </form>
    </div>
  );
}
