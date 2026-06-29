"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { importUsers } from "@/lib/admin/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";

const SAMPLE = "firstName,lastName,email,role,bivalence,region,dren,college";

/** Import CSV d'utilisateurs : lecture d'un fichier .csv ou collage direct. */
export function CsvImport() {
  const [csv, setCsv] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setCsv(await file.text());
  }

  return (
    <form action={importUsers} className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
        >
          <FileSpreadsheet className="h-4 w-4" /> Choisir un fichier .csv
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0] ?? undefined)}
        />
        <span className="text-xs text-[var(--text-secondary)]">ou collez le contenu ci-dessous</span>
      </div>

      <textarea
        name="csv"
        required
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={6}
        placeholder={`${SAMPLE}\nAya,Koffi,aya.koffi@exemple.ci,APPRENANT,PC · SVT,Gbêkê,DREN Bouaké,Collège X`}
        className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 font-mono text-xs outline-none focus:border-orange-500"
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-secondary)]">
          En-tête requis : <code>firstName,lastName,email</code>. Mot de passe temporaire : <strong>Bienvenue2026!</strong>
        </p>
        <SubmitButton pendingLabel="Import…" className="px-5">
          <Upload className="h-4 w-4" /> Importer
        </SubmitButton>
      </div>
    </form>
  );
}
