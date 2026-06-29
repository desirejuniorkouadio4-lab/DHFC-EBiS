"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "ALL", label: "Tous les rôles" },
  { value: "APPRENANT", label: "Apprenants" },
  { value: "TUTEUR", label: "Tuteurs" },
  { value: "ENCADREUR", label: "Encadreurs" },
  { value: "CONCEPTEUR", label: "Concepteurs" },
  { value: "ADMIN", label: "Administrateurs" },
  { value: "SUPERADMIN", label: "Super-admins" },
];

/** Recherche + filtre de rôle (met à jour l'URL). */
export function UserSearch({ initialQ, initialRole }: { initialQ: string; initialRole: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQ);
  const [pending, startTransition] = useTransition();

  // Debounce de la recherche texte.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      startTransition(() => router.replace(`/admin/utilisateurs?${next.toString()}`));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setRole(role: string) {
    const next = new URLSearchParams(params.toString());
    if (role && role !== "ALL") next.set("role", role);
    else next.delete("role");
    startTransition(() => router.replace(`/admin/utilisateurs?${next.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        {pending && <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-orange-500" />}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom ou e-mail…"
          className="h-11 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] pl-10 pr-10 text-sm outline-none focus:border-orange-500"
        />
      </div>
      <select
        defaultValue={initialRole}
        onChange={(e) => setRole(e.target.value)}
        className="h-11 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 text-sm outline-none focus:border-orange-500 sm:w-56"
      >
        {ROLE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
